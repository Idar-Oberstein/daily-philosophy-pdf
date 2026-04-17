import {
  Document,
  Page,
  StyleSheet,
  Text,
  View
} from "@react-pdf/renderer";

import type { DailyEssayDraft } from "@/lib/openai/schema";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 58,
    paddingHorizontal: 54,
    fontFamily: "Times-Roman",
    color: "#23190f",
    fontSize: 11,
    lineHeight: 1.5,
    backgroundColor: "#fffaf2"
  },
  headerRule: {
    borderBottomWidth: 1,
    borderBottomColor: "#d9c4a4",
    paddingBottom: 10,
    marginBottom: 18
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#8c6736",
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontFamily: "Times-Bold",
    lineHeight: 1.15,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 12,
    color: "#5d4830",
    marginBottom: 14
  },
  hook: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 18
  },
  section: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 6
  },
  sectionBody: {
    fontSize: 11,
    lineHeight: 1.55
  },
  quoteBox: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#efe2cf",
    borderLeftWidth: 4,
    borderLeftColor: "#9f6d2d"
  },
  quoteLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    color: "#7e5b2f",
    marginBottom: 6
  },
  takeawaysTitle: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 6
  },
  takeaway: {
    marginBottom: 6
  },
  footerMeta: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d9c4a4",
    fontSize: 9,
    color: "#7b6243"
  }
});

export function EssayDocument({
  draft,
  dateLabel,
  wordCount
}: {
  draft: DailyEssayDraft;
  dateLabel: string;
  wordCount: number;
}) {
  return (
    <Document title={draft.title} author="Daily Philosophy PDF">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRule}>
          <Text style={styles.eyebrow}>Daily Philosophy</Text>
          <Text style={styles.title}>{draft.title}</Text>
          <Text style={styles.subtitle}>{draft.subtitle}</Text>
          <Text style={styles.hook}>{draft.hook}</Text>
        </View>

        {draft.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <Text style={styles.sectionBody}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.quoteBox}>
          <Text style={styles.quoteLabel}>Practice For Today</Text>
          <Text>{draft.reflectionExercise}</Text>
        </View>

        <View>
          <Text style={styles.takeawaysTitle}>Practical Takeaways</Text>
          {draft.takeaways.map((takeaway) => (
            <Text key={takeaway} style={styles.takeaway}>
              - {takeaway}
            </Text>
          ))}
        </View>

        <Text style={styles.footerMeta}>
          {dateLabel} | {draft.metadata.thinkerOrExperiment} | {draft.metadata.cluster}
          {" | "}
          {wordCount} words
        </Text>
      </Page>
    </Document>
  );
}
