import "server-only";

import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import { libraryCatalog, type LibrarySource } from "@/lib/library/catalog";
import type { TopicSeed } from "@/lib/topics/types";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (params: { data: Buffer }) => {
    getText: () => Promise<{ text?: string }>;
    destroy: () => Promise<void>;
  };
};

type SourceChunk = {
  source: LibrarySource;
  excerpt: string;
  score: number;
};

type RetrievedLibraryContext = {
  sourceNotes: string;
  sourceTitles: string[];
};

const sourceTextCache = new Map<string, Promise<string>>();

function tokenize(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 4)
    )
  );
}

function buildQueryTerms(topic: TopicSeed) {
  return tokenize(
    [
      topic.id,
      topic.cluster,
      topic.titleSeed,
      topic.thinkerOrExperiment,
      topic.angle,
      topic.behaviorLink,
      topic.practicalDirection,
      topic.tags.join(" ")
    ].join(" ")
  );
}

function scoreSource(source: LibrarySource, terms: string[]) {
  const haystack = `${source.title} ${source.tags.join(" ")}`.toLowerCase();
  return terms.reduce((score, term) => {
    if (haystack.includes(term)) {
      return score + (source.tags.includes(term) ? 6 : 3);
    }

    return score;
  }, 0);
}

async function extractSourceText(source: LibrarySource) {
  const cached = sourceTextCache.get(source.id);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const parser = new PDFParse({
      data: await readFile(source.filePath)
    });

    try {
      const result = await parser.getText();
      return (result.text ?? "").replace(/\u0000/g, " ").trim();
    } finally {
      await parser.destroy();
    }
  })();

  sourceTextCache.set(source.id, promise);
  return promise;
}

function chunkText(text: string) {
  const cleaned = text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length >= 220);

  const chunks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if ((buffer + " " + paragraph).trim().length <= 1400) {
      buffer = `${buffer} ${paragraph}`.trim();
      continue;
    }

    if (buffer) {
      chunks.push(buffer);
    }

    buffer = paragraph;
  }

  if (buffer) {
    chunks.push(buffer);
  }

  if (chunks.length === 0 && cleaned) {
    chunks.push(cleaned.slice(0, 1400));
  }

  return chunks.slice(0, 40);
}

function scoreChunk(chunk: string, source: LibrarySource, terms: string[]) {
  const haystack = `${source.title} ${source.tags.join(" ")} ${chunk}`.toLowerCase();
  return terms.reduce((score, term) => {
    if (!haystack.includes(term)) {
      return score;
    }

    if (source.tags.includes(term)) {
      return score + 7;
    }

    if (source.title.toLowerCase().includes(term)) {
      return score + 5;
    }

    return score + 2;
  }, 0);
}

function cleanExcerpt(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .slice(0, 1100);
}

export async function retrieveLibraryContext(topic: TopicSeed): Promise<RetrievedLibraryContext> {
  const terms = buildQueryTerms(topic);
  const rankedSources = libraryCatalog
    .map((source) => ({
      source,
      score: scoreSource(source, terms)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((entry) => entry.source);

  const shortlistedSources =
    rankedSources.length > 0 ? rankedSources : libraryCatalog.slice(0, 4);

  const chunkCandidates: SourceChunk[] = [];

  for (const source of shortlistedSources) {
    const text = await extractSourceText(source);
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const score = scoreChunk(chunk, source, terms);
      if (score > 0) {
        chunkCandidates.push({
          source,
          excerpt: cleanExcerpt(chunk),
          score
        });
      }
    }
  }

  const selectedChunks = chunkCandidates
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);

  if (selectedChunks.length === 0) {
    for (const source of shortlistedSources.slice(0, 3)) {
      const text = await extractSourceText(source);
      const [firstChunk] = chunkText(text);

      if (firstChunk) {
        selectedChunks.push({
          source,
          excerpt: cleanExcerpt(firstChunk),
          score: 0
        });
      }
    }
  }

  const sourceNotes = selectedChunks
    .map(
      (chunk, index) =>
        `Source packet ${index + 1} — ${chunk.source.title}\n${chunk.excerpt}`
    )
    .join("\n\n");

  return {
    sourceNotes,
    sourceTitles: Array.from(new Set(selectedChunks.map((chunk) => chunk.source.title)))
  };
}
