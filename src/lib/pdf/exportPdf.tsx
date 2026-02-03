import React from "react";
import { Document, Page, Text, View, Font, pdf } from "@react-pdf/renderer";
import { parseFountain } from "@/lib/fountain/parse";

// Register a Courier-like font (React-PDF has built-ins, but we explicitly set style)
Font.register({
  family: "Courier",
  fonts: [{ src: undefined as any }], // fallback to default Courier-like
});

const styles = {
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
    fontFamily: "Courier",
    fontSize: 12,
    lineHeight: 1.25,
  },
  scene: { marginTop: 12, textTransform: "uppercase" as const },
  action: { marginTop: 10 },
  character: { marginTop: 10, marginLeft: 200, textTransform: "uppercase" as const },
  dialogue: { marginLeft: 160, marginRight: 80 },
  parenthetical: { marginLeft: 180, marginRight: 120 },
  transition: { marginTop: 10, textAlign: "right" as const, textTransform: "uppercase" as const },
  centered: { marginTop: 10, textAlign: "center" as const },
  pagebreak: { marginTop: 18 },
};

function ScreenplayDoc({ title, content }: { title: string; content: string }) {
  const lines = parseFountain(content);

  return (
    <Document>
      <Page size="LETTER" style={styles.page as any}>
        {/* Title page vibe (simple MVP) */}
        <View>
          <Text style={{ textAlign: "center", marginTop: 120, fontSize: 18 }}>{title}</Text>
          <Text style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#555" }}>
            Exported from SceneFlow
          </Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page as any}>
        {lines.map((l, idx) => {
          const raw = l.raw.trim();
          if (l.type === "empty") return <Text key={idx}> </Text>;
          if (l.type === "note") return null; // notes excluded by default
          if (l.type === "page_break") return <Text key={idx} style={styles.pagebreak as any}> </Text>;

          if (l.type === "scene") return <Text key={idx} style={styles.scene as any}>{raw}</Text>;
          if (l.type === "action") return <Text key={idx} style={styles.action as any}>{raw}</Text>;
          if (l.type === "character") return <Text key={idx} style={styles.character as any}>{raw}</Text>;
          if (l.type === "dialogue") return <Text key={idx} style={styles.dialogue as any}>{raw}</Text>;
          if (l.type === "parenthetical") return <Text key={idx} style={styles.parenthetical as any}>{raw}</Text>;
          if (l.type === "transition") return <Text key={idx} style={styles.transition as any}>{raw}</Text>;
          if (l.type === "centered") return <Text key={idx} style={styles.centered as any}>{raw.replace(/^>\s?/, "")}</Text>;

          return <Text key={idx}>{raw}</Text>;
        })}
      </Page>
    </Document>
  );
}

export async function exportPdfBlob(title: string, content: string) {
  const instance = pdf(<ScreenplayDoc title={title} content={content} />);
  const blob = await instance.toBlob();
  return blob;
}
