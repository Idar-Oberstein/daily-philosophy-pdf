export function formatEssayDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}
