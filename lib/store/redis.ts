import "server-only";

import { Redis } from "@upstash/redis";

import { getConfig } from "@/lib/config";

let cachedRedis: Redis | null = null;

export function getRedis() {
  if (cachedRedis) {
    return cachedRedis;
  }

  const config = getConfig();
  cachedRedis = new Redis({
    url: config.UPSTASH_REDIS_REST_URL,
    token: config.UPSTASH_REDIS_REST_TOKEN
  });

  return cachedRedis;
}
