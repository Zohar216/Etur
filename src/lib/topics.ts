export type Section = "מיצוב" | "איתור";

export const SECTION_OPTIONS: Section[] = ["מיצוב", "איתור"];

export const TOPICS_BY_SECTION: Record<Section, string[]> = {
  מיצוב: ['יח"צ', "דיגיטל", "ביקורים"],
  איתור: ["חוגרים", "קצינים", "נגדים"],
};

export function isValidSection(value: unknown): value is Section {
  return typeof value === "string" && SECTION_OPTIONS.includes(value as Section);
}

export function isValidTopic(section: Section, topic: unknown): topic is string {
  return (
    typeof topic === "string" &&
    TOPICS_BY_SECTION[section].includes(topic)
  );
}

