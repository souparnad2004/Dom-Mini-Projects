import crypto from "crypto";
import { pubClient } from "./redisClient.js";
import { getSession } from "./session.js";
import { getAllCheckedBoxes, getCheckboxOwner, setCheckbox, removeCheckbox, getCheckedCount, publishCheckboxUpdate } from "./checkboxState.js";
import { socketRateLimit } from "./rateLimiter.js";
import { CHECK_EVENT_CHANNEL, SOCKET_RATE_LIMIT, SOCKET_RATE_WINDOW } from "./config/config.js";

const SERVER_INSTANCE_ID = crypto.randomUUID();

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((pair) => pair.split("="))
      .filter((entry) => entry.length === 2)
      .map(([key, value]) => [key.trim(), decodeURIComponent(value)]),
  );
}

export async function attachSocket(io) {
  io.use(async (socket, next) => {
    const cookies = parseCookies(socket.request.headers.cookie || "");
    const sessionId = cookies.session_id;

    if (!sessionId) {
      socket.data.user = null;
      return next();
    }

    const session = await getSession(sessionId);
    if (!session || !session.user) {
      socket.data.user = null;
      return next();
    }

    socket.data.user = session.user;
    return next();
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user || null;
    const checkedBoxes = await getAllCheckedBoxes();
    const totalCount = checkedBoxes.length;

    socket.emit("init-state", {
      checkedBoxes,
      totalCount,
      currentUserId: user?.userId || null,
    });

    socket.on("checkbox-change", async (payload) => {
      if (!user) {
        return socket.emit("action-error", { message: "Please login to change boxes" });
      }

      const rate = await socketRateLimit({
        socketId: socket.id,
        userId: user.userId,
        limit: SOCKET_RATE_LIMIT,
        windowSeconds: SOCKET_RATE_WINDOW,
      });

      if (!rate.allowed) {
        return socket.emit("action-error", {
          message: `Rate limit exceeded: ${rate.count}/${rate.limit} in ${SOCKET_RATE_WINDOW}s`,
        });
      }

      const index = Number(payload.id);
      const checked = Boolean(payload.checked);

      try {
        const existingOwner = await getCheckboxOwner(index);

        if (checked) {
          await setCheckbox(index, {
            userId: user.userId,
            name: user.name,
            email: user.email,
          });
        } else {
          if (!existingOwner) {
            return socket.emit("action-error", { message: "Box is already unchecked" });
          }
          if (existingOwner.userId !== user.userId) {
            return socket.emit("action-error", { message: "You can only uncheck your own boxes" });
          }
          await removeCheckbox(index);
        }

        const totalCount = await getCheckedCount();
        const update = {
          index,
          checked,
          owner: checked
            ? {
                userId: user.userId,
                name: user.name,
                email: user.email,
              }
            : null,
          totalCount,
          source: SERVER_INSTANCE_ID,
        };

        io.emit("checkbox-change", update);
        await publishCheckboxUpdate(update);
      } catch (err) {
        console.error("checkbox-change error", err);
        socket.emit("action-error", { message: "Unable to update checkbox" });
      }
    });
  });

  await pubClient.subscribe(CHECK_EVENT_CHANNEL, (message) => {
    try {
      const update = JSON.parse(message);
      if (update.source === SERVER_INSTANCE_ID) return;
      io.emit("checkbox-change", update);
    } catch (err) {
      console.error("pubsub parse error", err);
    }
  });
}
