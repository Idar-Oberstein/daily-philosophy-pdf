import "server-only";

import { getRedis } from "@/lib/store/redis";

import type { PublishedEssayRecord } from "@/lib/archive/types";

const archiveIndexKey = "archive:essay-slugs";
const archiveRecordKey = (slug: string) => `archive:essay:${slug}`;

function parseRecord(rawEntry: string | null) {
  if (!rawEntry) {
    return null;
  }

  try {
    return JSON.parse(rawEntry) as PublishedEssayRecord;
  } catch {
    return null;
  }
}

export async function upsertPublishedEssay(record: PublishedEssayRecord) {
  const redis = getRedis();
  const serialized = JSON.stringify(record);

  await redis.set(archiveRecordKey(record.slug), serialized);
  await redis.lrem(archiveIndexKey, 0, record.slug);
  await redis.lpush(archiveIndexKey, record.slug);
  await redis.ltrim(archiveIndexKey, 0, 199);
}

export async function getPublishedEssay(slug: string) {
  const redis = getRedis();
  const rawEntry = await redis.get<string>(archiveRecordKey(slug));
  return parseRecord(rawEntry);
}

export async function listPublishedEssays(limit = 24) {
  const redis = getRedis();
  const slugs = await redis.lrange<string>(archiveIndexKey, 0, Math.max(0, limit - 1));
  const entries = await Promise.all(slugs.map((slug) => getPublishedEssay(slug)));

  return entries.filter((entry): entry is PublishedEssayRecord => entry !== null);
}
