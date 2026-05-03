import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import axios from "axios";
import crypto from "crypto";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_BASE_URL,
  CHECKBOX_GRID_SIZE,
  OIDC_CLIENT_ID,
  OIDC_ISSUER,
  OIDC_REDIRECT_URI,
  PORT,
  API_RATE_LIMIT,
  API_RATE_WINDOW,
  SESSION_TTL,
} from "./config/config.js";
import { createSession, deleteSession, getSession } from "./session.js";
import { expressRateLimit } from "./rateLimiter.js";
import { attachSocket } from "./socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: APP_BASE_URL,
    credentials: true,
  },
});

const apiLimiter = expressRateLimit({
  limit: API_RATE_LIMIT,
  windowSeconds: API_RATE_WINDOW,
  prefix: "http",
  keyGenerator: (req) => req.ip,
});

app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/api/config", (req, res) => {
  res.json({
    oidcIssuer: OIDC_ISSUER,
    oidcClientId: OIDC_CLIENT_ID,
    redirectUri: OIDC_REDIRECT_URI,
    gridSize: CHECKBOX_GRID_SIZE,
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..","public", "index.html"));
});

app.get("/api/session", async (req, res) => {
  const sessionId = req.cookies.session_id;
  if (!sessionId) return res.status(401).json({ error: "not_authenticated" });

  const session = await getSession(sessionId);
  if (!session || !session.user) return res.status(401).json({ error: "not_authenticated" });

  return res.json({ user: session.user });
});

app.post("/api/auth/callback", async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({ error: "missing_parameters" });
  }

  if (!OIDC_CLIENT_ID) {
    return res.status(500).json({ error: "missing_oidc_client_id" });
  }

  try {
    const tokenRes = await axios.post(
      `${OIDC_ISSUER}/api/oauth/token`,
      {
        grant_type: "authorization_code",
        code,
        client_id: OIDC_CLIENT_ID,
        redirect_uri,
        code_verifier,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get(`${OIDC_ISSUER}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = userRes.data;
    const sessionId = crypto.randomUUID();
    const user = {
      userId: profile.sub,
      name: profile.name || profile.email || profile.sub,
      email: profile.email || null,
    };

    await createSession(sessionId, user);

    res.cookie("session_id", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL * 1000,
    });

    return res.json({ user });
  } catch (error) {
    console.error("OIDC callback error", error?.response?.data || error?.message || error);
    return res.status(500).json({ error: "oidc_callback_failed" });
  }
});

app.post("/api/logout", async (req, res) => {
  const sessionId = req.cookies.session_id;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  res.clearCookie("session_id", { path: "/" });
  return res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "server_error" });
});

attachSocket(io).catch((error) => {
  console.error("Socket attach failed", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
