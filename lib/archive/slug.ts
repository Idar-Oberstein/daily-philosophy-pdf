function slugifyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildEssaySlug(dateKey: string, topicId: string) {
  const safeTopicId = slugifyPart(topicId) || "essay";
  return `${dateKey}-${safeTopicId}`;
}

export function buildEssayPathname(dateKey: string, slug: string) {
  return `essays/${dateKey}/${slug}.pdf`;
}
