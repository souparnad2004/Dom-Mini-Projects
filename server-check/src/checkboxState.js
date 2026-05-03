import { redis, pubClient } from "./redisClient.js";
import { CHECK_STATE_KEY, CHECK_EVENT_CHANNEL } from "./config/config.js";

export async function getAllCheckedBoxes() {
  const raw = await redis.hGetAll(CHECK_STATE_KEY);
  return Object.entries(raw).map(([index, value]) => {
    const owner = JSON.parse(value);
    return {
      index: Number(index),
      owner,
    };
  });
}

export async function getCheckedCount() {
  return Number(await redis.hLen(CHECK_STATE_KEY));
}

export async function getCheckboxOwner(index) {
  const raw = await redis.hGet(CHECK_STATE_KEY, String(index));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setCheckbox(index, owner) {
  await redis.hSet(CHECK_STATE_KEY, String(index), JSON.stringify(owner));
}

export async function removeCheckbox(index) {
  await redis.hDel(CHECK_STATE_KEY, String(index));
}

export async function publishCheckboxUpdate(update) {
  await pubClient.publish(CHECK_EVENT_CHANNEL, JSON.stringify(update));
}
