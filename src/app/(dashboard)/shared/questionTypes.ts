export const SKD_QUESTION_TYPES = [
  { type: "TIU", label: "TIU" },
  { type: "TWK", label: "TWK" },
  { type: "TKP", label: "TKP" },
] as const;

export const TPA_QUESTION_TYPES = [
  { type: "Verbal", label: "Verbal" },
  { type: "Numerik", label: "Numerik" },
  { type: "Logika / Penalaran", label: "Logika / Penalaran" },
  { type: "Figural / Spasial", label: "Figural / Spasial" },
] as const;

export function getQuestionTypes(testName?: string | null) {
  return String(testName || "").toUpperCase() === "TPA"
    ? TPA_QUESTION_TYPES
    : SKD_QUESTION_TYPES;
}
