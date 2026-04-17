import "server-only";

import { getRedis } from "@/lib/store/redis";

import type { PublishedEssayRecord } from "@/lib/archive/types";

const archiveIndexKey = "archive:essay-slugs";
const archiveRecordKey = (slug: string) => `archive:essay:${slug}`;
const pendingArchiveIndexKey = "archive:pending-slugs";
const pendingArchiveKey = (slug: string) => `archive:pending:${slug}`;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRecord(rawEntry: string | PublishedEssayRecord | null) {
  if (!rawEntry) {
    return null;
  }

  if (typeof rawEntry === "object") {
    return rawEntry as PublishedEssayRecord;
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
  await redis.del(pendingArchiveKey(record.slug));
  await redis.lrem(pendingArchiveIndexKey, 0, record.slug);
}

export async function enqueuePendingPublishedEssay(record: PublishedEssayRecord) {
  const redis = getRedis();
  const serialized = JSON.stringify(record);

  await redis.set(pendingArchiveKey(record.slug), serialized);
  await redis.lrem(pendingArchiveIndexKey, 0, record.slug);
  await redis.lpush(pendingArchiveIndexKey, record.slug);
  await redis.ltrim(pendingArchiveIndexKey, 0, 199);
}

export async function upsertPublishedEssayWithRetry(
  record: PublishedEssayRecord,
  options?: { attempts?: number; baseDelayMs?: number }
) {
  const attempts = Math.max(1, options?.attempts ?? 3);
  const baseDelayMs = Math.max(0, options?.baseDelayMs ?? 150);

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await upsertPublishedEssay(record);
      return true;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await wait(baseDelayMs * attempt);
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  return false;
}

export async function reconcilePendingPublishedEssays(limit = 6) {
  const redis = getRedis();
  const slugs = await redis.lrange<string>(pendingArchiveIndexKey, 0, Math.max(0, limit - 1));

  let repaired = 0;

  for (const slug of slugs) {
    const rawEntry = await redis.get<string | PublishedEssayRecord>(pendingArchiveKey(slug));
    const record = parseRecord(rawEntry);

    if (!record) {
      await redis.del(pendingArchiveKey(slug));
      await redis.lrem(pendingArchiveIndexKey, 0, slug);
      continue;
    }

    try {
      await upsertPublishedEssayWithRetry(record, { attempts: 2, baseDelayMs: 80 });
      repaired += 1;
    } catch {
      // Keep the entry in the pending queue for a future repair attempt.
    }
  }

  return repaired;
}

export async function getPublishedEssay(slug: string) {
  try {
    await reconcilePendingPublishedEssays(4);
  } catch {
    // Public reads should stay resilient even if reconciliation fails.
  }

  const redis = getRedis();
  const rawEntry = await redis.get<string | PublishedEssayRecord>(archiveRecordKey(slug));
  return parseRecord(rawEntry);
}

export async function listPublishedEssays(limit = 24) {
  try {
    await reconcilePendingPublishedEssays(6);
  } catch {
    // Public reads should stay resilient even if reconciliation fails.
  }

  const redis = getRedis();
  const slugs = await redis.lrange<string>(archiveIndexKey, 0, Math.max(0, limit - 1));
  const entries = await Promise.all(slugs.map((slug) => getPublishedEssay(slug)));

  return entries.filter((entry): entry is PublishedEssayRecord => entry !== null);
}
