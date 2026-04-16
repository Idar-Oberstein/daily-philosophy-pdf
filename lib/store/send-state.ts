import "server-only";

import { getRedis } from "@/lib/store/redis";

export type SendRecord = {
  dateKey: string;
  title: string;
  topicId: string;
  cluster: string;
  model: string;
  sentAt: string;
  status: "sent" | "failed";
  openaiRequestId: string | null;
  repairOpenaiRequestId: string | null;
  resendEmailId: string | null;
  wordCount: number;
  errorCode?: string;
  errorMessage?: string;
};

const sentKey = (dateKey: string) => `essay:sent:${dateKey}`;
const lockKey = (dateKey: string) => `essay:lock:${dateKey}`;
const recordKey = (dateKey: string) => `essay:record:${dateKey}`;

export async function hasSuccessfulSend(dateKey: string) {
  const redis = getRedis();
  const result = await redis.exists(sentKey(dateKey));
  return result === 1;
}

export async function acquireSendLock(dateKey: string, ttlSeconds = 900) {
  const redis = getRedis();
  const result = await redis.set(lockKey(dateKey), crypto.randomUUID(), {
    nx: true,
    ex: ttlSeconds
  });

  return result === "OK";
}

export async function releaseSendLock(dateKey: string) {
  const redis = getRedis();
  await redis.del(lockKey(dateKey));
}

export async function markSuccessfulSend(record: SendRecord) {
  const redis = getRedis();
  await redis.set(sentKey(record.dateKey), record.sentAt);
  await redis.set(recordKey(record.dateKey), record);
}

export async function writeFailureRecord(
  dateKey: string,
  record: Omit<SendRecord, "dateKey" | "status" | "sentAt"> & {
    sentAt?: string;
  }
) {
  const redis = getRedis();
  await redis.set(recordKey(dateKey), {
    ...record,
    dateKey,
    sentAt: record.sentAt ?? new Date().toISOString(),
    status: "failed"
  } satisfies SendRecord);
}

export async function getSendRecord(dateKey: string) {
  const redis = getRedis();
  return redis.get<SendRecord>(recordKey(dateKey));
}
