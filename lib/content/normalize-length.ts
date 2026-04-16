import type { DailyEssayDraft } from "@/lib/openai/schema";

const MIN_WORDS = 1300;
const MAX_WORDS = 1700;
const MAX_SECTION_WORDS = 320;

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function truncateToWordBudget(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

function trimLongestSection(draft: DailyEssayDraft) {
  const sections = [...draft.sections];
  let longestIndex = 0;

  sections.forEach((section, index) => {
    if (countWords(section.body) > countWords(sections[longestIndex].body)) {
      longestIndex = index;
    }
  });

  const sentences = splitSentences(sections[longestIndex].body);
  if (sentences.length > 2) {
    sentences.pop();
    sections[longestIndex] = {
      ...sections[longestIndex],
      body: sentences.join(" ")
    };
  } else {
    sections[longestIndex] = {
      ...sections[longestIndex],
      body: truncateToWordBudget(sections[longestIndex].body, MAX_SECTION_WORDS - 20)
    };
  }

  return {
    ...draft,
    sections
  };
}

function expandBestSection(draft: DailyEssayDraft) {
  const sections = [...draft.sections];
  const index = 0;
  const practicalSentence = [
    `Seen from the angle of ${draft.metadata.thinkerOrExperiment}, the pressure point is not abstract morality but the way this choice trains perception, attention, and character.`,
    `The tension returns whenever someone is tempted to trade ${draft.metadata.behaviorLink.toLowerCase()} for convenience, status, or self-protection.`,
    draft.takeaways[0]
  ].join(" ");
  sections[index] = {
    ...sections[index],
    body: `${sections[index].body} ${practicalSentence}`
  };

  return {
    ...draft,
    sections
  };
}

function clampSectionBodies(draft: DailyEssayDraft) {
  return {
    ...draft,
    sections: draft.sections.map((section) => ({
      ...section,
      body: truncateToWordBudget(section.body, MAX_SECTION_WORDS)
    }))
  };
}

export function getDraftWordCount(draft: DailyEssayDraft) {
  const sectionWords = draft.sections.reduce(
    (total, section) =>
      total +
      countWords(section.heading) +
      countWords(section.purpose) +
      countWords(section.body),
    0
  );

  return (
    countWords(draft.title) +
    countWords(draft.subtitle) +
    countWords(draft.hook) +
    sectionWords +
    draft.takeaways.reduce((total, takeaway) => total + countWords(takeaway), 0) +
    countWords(draft.reflectionExercise)
  );
}

export function normalizeEssayDraft(draft: DailyEssayDraft) {
  let normalized = clampSectionBodies(draft);
  let wordCount = getDraftWordCount(normalized);

  while (wordCount > MAX_WORDS) {
    const next = trimLongestSection(normalized);
    if (getDraftWordCount(next) === wordCount) {
      break;
    }

    normalized = next;
    wordCount = getDraftWordCount(normalized);
  }

  while (wordCount < MIN_WORDS) {
    normalized = expandBestSection(normalized);
    wordCount = getDraftWordCount(normalized);
    if (wordCount > MAX_WORDS) {
      normalized = trimLongestSection(normalized);
      wordCount = getDraftWordCount(normalized);
      break;
    }
  }

  return {
    draft: normalized,
    wordCount
  };
}
