export const SKD_PASSING_GRADE_TYPES = [
  { type: "TWK", label: "TWK", defaultValue: 65 },
  { type: "TIU", label: "TIU", defaultValue: 80 },
  { type: "TKP", label: "TKP", defaultValue: 166 },
] as const;

export const TPA_PASSING_GRADE_TYPES = [
  { type: "Verbal", label: "Verbal", defaultValue: 0 },
  { type: "Numerik", label: "Numerik", defaultValue: 0 },
  { type: "Logika / Penalaran", label: "Logika / Penalaran", defaultValue: 0 },
  { type: "Figural / Spasial", label: "Figural / Spasial", defaultValue: 0 },
] as const;

export function getPassingGradeTypes(testName?: string | null) {
  return String(testName || "").toUpperCase() === "TPA"
    ? TPA_PASSING_GRADE_TYPES
    : SKD_PASSING_GRADE_TYPES;
}

export function getDefaultPassingGrades(testName?: string | null) {
  return Object.fromEntries(
    getPassingGradeTypes(testName).map((grade) => [
      grade.type,
      grade.defaultValue,
    ])
  );
}
