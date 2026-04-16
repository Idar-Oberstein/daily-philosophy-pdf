import type { SendRecord } from "@/lib/store/send-state";
import { topicBank } from "@/lib/topics/topic-bank";
import type { TopicSeed } from "@/lib/topics/types";

type RankedTopic = {
  topic: TopicSeed;
  score: number;
};

function scoreTopic(topic: TopicSeed, history: SendRecord[]) {
  return history.reduce((score, record, index) => {
    const distanceWeight = Math.max(1, 8 - index);

    if (record.topicId === topic.id) {
      score += 100;
    }

    if (record.cluster === topic.cluster) {
      score += 8 * distanceWeight;
    }

    return score;
  }, 0);
}

export function selectTopic(history: SendRecord[]) {
  const rankedTopics: RankedTopic[] = topicBank.map((topic) => ({
    topic,
    score: scoreTopic(topic, history)
  }));

  rankedTopics.sort((left, right) => left.score - right.score);
  const candidatePool = rankedTopics.filter(
    (entry) => entry.score <= rankedTopics[0].score + 6
  );

  return candidatePool[Math.floor(Math.random() * candidatePool.length)].topic;
}
