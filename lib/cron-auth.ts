import "server-only";

import { getConfig } from "@/lib/config";

export function isAuthorizedCronRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${getConfig().CRON_SECRET}`;
  return authHeader === expected;
}
