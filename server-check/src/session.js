import { redis } from "./redisClient.js";
import { SESSION_PREFIX, SESSION_TTL } from "./config/config.js";

export function sessionKey(sessionId) {
  return `${SESSION_PREFIX}${sessionId}`;
}

export async function createSession(sessionId, user) {
  const key = sessionKey(sessionId);
  await redis.set(key, JSON.stringify({ user }));
  await redis.expire(key, SESSION_TTL);
}

export async function getSession(sessionId) {
  const raw = await redis.get(sessionKey(sessionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId) {
  await redis.del(sessionKey(sessionId));
}
