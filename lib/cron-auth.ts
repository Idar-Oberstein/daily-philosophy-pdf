import "server-only";

export function isAuthorizedCronRequest(request: Request, cronSecret: string) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;
  return authHeader === expected;
}
