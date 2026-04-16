import "server-only";

import type { SendRecord } from "@/lib/store/send-state";
import { getRedis } from "@/lib/store/redis";

const historyKey = "essay:sent-history";

export async function appendSendHistory(record: SendRecord) {
  const redis = getRedis();
  await redis.lpush(historyKey, JSON.stringify(record));
  await redis.ltrim(historyKey, 0, 59);
}

export async function getRecentSendHistory(limit = 21): Promise<SendRecord[]> {
  const redis = getRedis();
  const rawEntries = await redis.lrange<string>(historyKey, 0, Math.max(0, limit - 1));

  return rawEntries
    .map((entry) => {
      try {
        return JSON.parse(entry) as SendRecord;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is SendRecord => entry !== null);
}
