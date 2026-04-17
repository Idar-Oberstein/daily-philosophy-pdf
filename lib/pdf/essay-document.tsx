import {
  Circle,
  Document,
  Ellipse,
  Line,
  Page,
  Path,
  Svg,
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
  brandRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  brandMarkWrap: {
    width: 74,
    height: 58,
    marginRight: 10
  },
  brandWordmark: {
    display: "flex",
    flexDirection: "column"
  },
  brandTop: {
    fontSize: 18,
    fontFamily: "Helvetica-BoldOblique",
    color: "#5b2718",
    lineHeight: 0.95
  },
  brandBottom: {
    fontSize: 18,
    fontFamily: "Helvetica-BoldOblique",
    color: "#e1971e",
    lineHeight: 0.95
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

function PhiloSnacksPdfMark() {
  return (
    <Svg viewBox="0 0 280 220">
      <Ellipse cx="146" cy="190" rx="92" ry="14" fill="rgba(143,100,50,0.12)" />
      <Path
        d="M68 146c20-20 52-28 78-22 17 4 33 14 50 31l-8 14c-24-16-42-24-62-27-18-2-34 1-55 12z"
        fill="#fff4e6"
        stroke="#c98d39"
        strokeWidth={2}
      />
      <Path
        d="M210 146c-20-20-52-28-78-22-17 4-33 14-50 31l8 14c24-16 42-24 62-27 18-2 34 1 55 12z"
        fill="#fff4e6"
        stroke="#c98d39"
        strokeWidth={2}
      />
      <Path
        d="M66 146c23-25 59-34 93-27 20 4 38 16 55 36"
        fill="none"
        stroke="#6b3423"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <Path
        d="M214 146c-23-25-59-34-93-27-20 4-38 16-55 36"
        fill="none"
        stroke="#6b3423"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <Line x1="140" y1="122" x2="140" y2="170" stroke="#6b3423" strokeWidth={7} strokeLinecap="round" />

      <Circle cx="82" cy="78" r="27" fill="rgba(255,196,72,0.18)" />
      <Path
        d="M81 51c-15 0-27 11-27 25 0 10 6 18 14 23 3 2 4 5 5 8h17c1-3 2-6 5-8 8-5 14-13 14-23 0-14-12-25-28-25z"
        fill="#ffd45c"
        stroke="#d8901d"
        strokeWidth={3.5}
      />
      <Path d="M72 111h18M74 118h14M81 72v20M81 92l-8-8M81 92l8-8" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M81 38v-16M54 48 44 35M108 48l10-13M49 77H32M130 77h-17" fill="none" stroke="#e29a18" strokeWidth={3.5} strokeLinecap="round" />

      <Path
        d="M221 56c15 0 28 10 28 23 0 8-5 15-12 19l2 14-13-10h-5c-15 0-28-10-28-23s13-23 28-23z"
        fill="#fff4e6"
        stroke="#6b3423"
        strokeWidth={4}
      />
      <Path d="M205 74h25M201 86h29" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />

      <Path
        d="M136 43c-23 0-39 16-39 36 0 14 7 28 19 36l-4 17 15-9c4 1 8 2 12 2 23 0 39-16 39-37 0-20-16-45-42-45z"
        fill="#fff4e6"
        stroke="#6b3423"
        strokeWidth={4}
      />
      <Path
        d="M138 80c-7 0-12 6-12 12 0 5 2 9 7 12-4 4-7 11-7 19h24c0-9-3-15-7-19 5-3 8-7 8-12 0-6-6-12-13-12z"
        fill="#fffaf2"
        stroke="#6b3423"
        strokeWidth={4}
      />
      <Path d="M124 66c4-6 10-9 16-9 10 0 18 7 20 18" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M129 82c3-2 5-3 8-3M149 82c-3-2-5-3-8-3M135 94c2 1 6 1 9 0" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />

      <Path d="M167 124c14-6 29-5 44 5-11 3-20 3-30 1z" fill="#fff4e6" stroke="#6b3423" strokeWidth={4} />
      <Path d="M167 124c14-6 29-5 44 5" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M211 130c6 0 10 4 10 9s-4 9-10 9" fill="none" stroke="#6b3423" strokeWidth={4.5} strokeLinecap="round" />

      <Path d="M54 132l6-6 6 6-6 6zM214 122l6-6 6 6-6 6zM190 30l6-6 6 6-6 6z" fill="#e29a18" stroke="#e29a18" strokeWidth={3.5} />
    </Svg>
  );
}

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
    <Document title={draft.title} author="Philo-Snacks">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRule}>
          <View style={styles.brandRow}>
            <View style={styles.brandMarkWrap}>
              <PhiloSnacksPdfMark />
            </View>
            <View style={styles.brandWordmark}>
              <Text style={styles.brandTop}>Philo-</Text>
              <Text style={styles.brandBottom}>Snacks</Text>
            </View>
          </View>
          <Text style={styles.eyebrow}>Philo-Snacks</Text>
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
