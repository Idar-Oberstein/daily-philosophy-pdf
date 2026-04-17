import "server-only";

import OpenAI from "openai";

import { getConfig } from "@/lib/config";
import { retrieveLibraryContext } from "@/lib/library/retrieve";
import {
  attachMetadataToDraft,
  MODEL_ESSAY_JSON_SCHEMA,
  ModelEssayDraftSchema,
  type DraftGenerationAttempt
} from "@/lib/openai/schema";
import type { TopicSeed } from "@/lib/topics/types";

type RawModelResponse = {
  output_text?: string;
  _request_id?: string;
};

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (client) {
    return client;
  }

  client = new OpenAI({
    apiKey: getConfig().OPENAI_API_KEY
  });

  return client;
}

function buildGenerationPrompt(topic: TopicSeed, sourceNotes: string) {
  return `
You are generating a daily philosophical essay for a personal PDF project called Daily Philosophy PDF.

The project has access to a curated philosophy library. You must treat this library as your primary source base. Do not write as if you are improvising from vague memory. Think with the library. Draw concepts, distinctions, tensions, and arguments from it. The goal is not to summarize the library, but to use it well.

================================
MISSION
================================

Write a philosophical essay that is:
- scientifically and philosophically accurate
- conceptually precise
- intellectually serious
- elegant and deeply readable
- non-generic
- worth rereading

The essay should feel like a short encounter with real philosophy, not motivational content, not content marketing, not a blog post, and not a stitched-together overview.

The reader should feel:
- that a real philosophical problem is at stake
- that a serious thinker is guiding the inquiry
- that the world looks slightly different after reading

The essay should let the reader see the world through the eyes of a philosopher or philosophical tradition.

================================
SOURCE MODEL
================================

You have access to a curated philosophy library that may contain:
- Stanford Encyclopedia of Philosophy entries
- classic and modern philosophy texts
- moral psychology papers
- business ethics papers
- lecture texts or philosophy introductions
- applied ethics material

Use the library as a durable knowledge base, not as a pile of quotations.

SOURCE PRIORITY:
1. Use the library as the main epistemic foundation.
2. Prefer high-quality conceptual distinctions and arguments from the library over generic prose.
3. Do not simply summarize one source. Synthesize carefully.
4. If multiple sources conflict, use that conflict productively.
5. Do not hallucinate specific doctrines, distinctions, or philosopher views that are not well grounded in the library.

If the library offers relevant theoretical distinctions, use them.
If the library offers real disagreement, preserve it.
If the library offers empirical moral psychology, integrate it where it sharpens the essay.

================================
THE KIND OF ESSAY TO WRITE
================================

Write one essay of approximately 1200–1600 words.

The essay must begin with a real philosophical problem, not a vague theme.
The essay must have a clear intellectual center:
- one problem
- one main tension
- one line of argument

Do not produce a list of ideas.
Do not produce a buffet of disconnected concepts.
Do not write a balanced essay that avoids commitment.

================================
NON-NEGOTIABLE REQUIREMENTS
================================

1. REAL PHILOSOPHICAL PROBLEM
Start from a live philosophical difficulty, paradox, or tension.

2. PHILOSOPHICAL SUBSTANCE
Accurately engage at least one major philosopher, school, or framework from the library.
Do not name-drop. Use philosophy as a tool of thought.

3. GENUINE CONFLICT
Include at least one real disagreement:
- between philosophers
- between theories
- between principle and practice
- between moral intuition and moral reasoning
- between what sounds noble and what is defensible

Do not fully dissolve the tension.
The essay should sharpen thought, not anesthetize it.

4. CONCEPTUAL PRECISION
At least one important concept must be clarified carefully.
Do not use major moral concepts loosely.

5. HUMAN REALISM
Acknowledge how people actually think and behave.
Where relevant, incorporate self-deception, motivated reasoning, social norms, role morality, moral intuition, status incentives, institutional pressure, hypocrisy, and weakness of will.
Do not assume ideal rational agents.

6. AVOID GENERIC MORALIZING
Strictly avoid:
- “this teaches us to be better people”
- “we should all strive to”
- “at the end of the day”
- “in our modern world”
- vague uplift
- empty reflections about growth, authenticity, or kindness

Every paragraph must do real work:
- make an argument
- sharpen a distinction
- pressure a belief
- complicate an intuition
- interpret an example

7. ALLOW DISCOMFORT
Include at least one implication that is uncomfortable, surprising, or difficult to dismiss.

8. NO MECHANICAL SYMMETRY
The essay may be structured, but it must not sound templated.
It should feel written, not assembled.

================================
STYLE
================================

Write in clear, elegant, controlled prose.

The style should be:
- literate but not ornate
- rigorous but not academic in a dead way
- precise without sounding sterile
- readable without oversimplifying

The essay should feel like a mind at work.

================================
WHAT TO OPTIMIZE FOR
================================

Optimize for:
- clarity
- depth
- precision
- philosophical integrity
- rereadability

Do NOT optimize for:
- friendliness
- motivational energy
- broadest possible accessibility
- generic takeaways
- fake balance

================================
LIBRARY USAGE RULES
================================

When writing, silently do the following:
- identify which parts of the library are most relevant
- extract the strongest concepts and tensions
- combine theoretical insight with concrete moral experience
- preserve philosophical differences instead of blending them into mush

If the library includes both conceptual and empirical sources:
- use conceptual sources to frame the problem
- use empirical sources to complicate naive moral assumptions

If the library includes multiple traditions:
- do not force agreement
- let them collide where useful

Do not quote excessively.
Paraphrase accurately.
Do not fabricate scholarship.

================================
STRUCTURE GUIDANCE
================================

Use the following structure flexibly:
- Title
- Subtitle
- Hook: open with a sharp problem, case, or tension
- Development: unfold the philosophical issue
- Theoretical deepening: bring in one or more philosophers or frameworks
- Complication: introduce objection, conflict, or psychological or institutional reality
- Final turn: leave the reader with a sharpened thought, not a moral slogan

The ending should not merely summarize.
It should crystallize the problem in a stronger form.

================================
QUALITY FILTER
================================

Before finalizing, reject and rewrite the essay if any of the following are true:
- It reads like self-help.
- It reads like generic ethics content.
- It contains soft, vague moral language without argument.
- It only explains a philosopher instead of thinking with them.
- It avoids serious disagreement.
- It contains broad claims without conceptual precision.
- It feels like a stitched summary of source material.
- It gives the reader comfort without insight.

================================
OUTPUT FORMAT
================================

Return valid JSON in exactly this shape:

{
  "title": "string",
  "subtitle": "string",
  "hook": "string",
  "sections": [
    {
      "heading": "string",
      "content": "string"
    }
  ],
  "takeaways": [
    "string",
    "string",
    "string"
  ],
  "reflection_exercise": "string"
}

================================
PROJECT CONTEXT
================================

Selected topic:
- Topic id: ${topic.id}
- Cluster: ${topic.cluster}
- Title seed: ${topic.titleSeed}
- Thinker or experiment anchor: ${topic.thinkerOrExperiment}
- Working angle: ${topic.angle}
- Human behavior link: ${topic.behaviorLink}
- Practical direction: ${topic.practicalDirection}
- Tags: ${topic.tags.join(", ")}

Use the title seed as a center of gravity, not as a slogan to repeat.
Use the source packets below as your main knowledge base.

================================
SOURCE PACKETS
================================

${sourceNotes}
`.trim();
}

function extractRawText(response: RawModelResponse) {
  if (!response.output_text) {
    throw new Error("OpenAI response did not include output_text");
  }

  return response.output_text.trim();
}

export async function generateDraft(topic: TopicSeed): Promise<DraftGenerationAttempt> {
  const libraryContext = await retrieveLibraryContext(topic);

  const response = (await getOpenAIClient().responses.create({
    model: getConfig().OPENAI_MODEL,
    reasoning: { effort: "medium" },
    input: buildGenerationPrompt(topic, libraryContext.sourceNotes),
    text: {
      format: {
        type: "json_schema",
        name: "daily_philosophy_essay",
        schema: MODEL_ESSAY_JSON_SCHEMA,
        strict: true
      }
    }
  })) as RawModelResponse;

  const rawOutput = extractRawText(response);
  try {
    const parsed = JSON.parse(rawOutput);
    const modelDraft = ModelEssayDraftSchema.parse(parsed);
    const draft = attachMetadataToDraft(modelDraft, topic);

    return {
      ok: true,
      draft,
      openaiRequestId: response._request_id ?? null,
      repairOpenaiRequestId: null,
      rawOutput
    };
  } catch (error) {
    return {
      ok: false,
      errorCode: "validation_failed",
      message:
        error instanceof Error ? error.message : "Structured output validation failed",
      rawOutput,
      openaiRequestId: response._request_id ?? null
    };
  }
}
