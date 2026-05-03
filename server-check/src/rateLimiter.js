import { redis } from "./redisClient.js";
import { RATE_PREFIX } from "./config/config.js";

export async function incrementRateKey(key, windowSeconds) {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count;
}

export function expressRateLimit({ limit, windowSeconds, prefix, keyGenerator }) {
  return async (req, res, next) => {
    const keyBase = keyGenerator ? keyGenerator(req) : req.ip;
    const key = `${prefix}:${keyBase}`;
    const count = await incrementRateKey(key, windowSeconds);
    if (count > limit) {
      return res.status(429).json({ error: "rate_limit_exceeded" });
    }
    next();
  };
}

export async function socketRateLimit({ socketId, userId, limit, windowSeconds }) {
  const prefix = userId ? `${RATE_PREFIX}user` : `${RATE_PREFIX}socket`;
  const key = `${prefix}:${userId || socketId}`;
  const count = await incrementRateKey(key, windowSeconds);
  return {
    allowed: count <= limit,
    count,
    limit,
  };
}
