import { createClient } from "@valkey/client";
import { VALKEY_URL } from "./config/config.js";

const client = await createClient({ url: VALKEY_URL })
  .on("error", (err) => console.error("Redis error", err))
  .connect();

const pubClient = await client.duplicate().connect();

export { client as redis, pubClient };
