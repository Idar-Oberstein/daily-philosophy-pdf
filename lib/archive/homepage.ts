import type { PublishedEssayRecord } from "@/lib/archive/types";
import { formatEssayDate } from "@/lib/archive/format";

export type HomepageEssayEntry = {
  slug: string;
  title: string;
  subtitle: string;
  thinker: string;
  cluster: string;
  dateLabel: string;
  problemLine: string;
  hook: string;
  pdfUrl: string;
};

export type HomepageConstellationNode = {
  id: string;
  slug: string;
  label: string;
  cluster: string;
  title: string;
  problemLine: string;
  x: number;
  y: number;
  size: number;
};

function firstSentence(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/.+?[.!?](?:\s|$)/);
  return (match?.[0] ?? normalized).trim();
}

function clampLabel(value: string, max = 118) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function buildHomepageEntries(essays: PublishedEssayRecord[]): HomepageEssayEntry[] {
  return essays.map((essay) => ({
    slug: essay.slug,
    title: essay.title,
    subtitle: essay.subtitle,
    thinker: essay.metadata.thinkerOrExperiment,
    cluster: essay.metadata.cluster,
    dateLabel: formatEssayDate(essay.dateKey),
    problemLine: clampLabel(firstSentence(essay.hook || essay.subtitle || essay.title)),
    hook: essay.hook,
    pdfUrl: essay.pdfUrl
  }));
}

export function buildConstellationNodes(
  entries: HomepageEssayEntry[]
): HomepageConstellationNode[] {
  if (entries.length === 0) {
    return [];
  }

  const radiusX = 38;
  const radiusY = 30;
  const centerX = 50;
  const centerY = 52;

  return entries.slice(0, 14).map((entry, index, array) => {
    const angle = (-Math.PI / 2) + (index / Math.max(array.length, 1)) * (Math.PI * 2);
    const ripple = index % 2 === 0 ? 1 : -1;

    return {
      id: `${entry.slug}-${index}`,
      slug: entry.slug,
      label: entry.thinker,
      cluster: entry.cluster,
      title: entry.title,
      problemLine: entry.problemLine,
      x: centerX + Math.cos(angle) * (radiusX + ripple * 5),
      y: centerY + Math.sin(angle) * (radiusY + ripple * 4),
      size: 10 + (index % 4) * 3
    };
  });
}
