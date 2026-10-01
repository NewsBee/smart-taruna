export const SKD_PASSING_GRADE_TYPES = ["TWK", "TIU", "TKP"] as const;
export const TPA_PASSING_GRADE_TYPES = [
  "Verbal",
  "Numerik",
  "Logika / Penalaran",
  "Figural / Spasial",
] as const;
export const PASSING_GRADE_TYPES = [
  ...SKD_PASSING_GRADE_TYPES,
  ...TPA_PASSING_GRADE_TYPES,
] as const;

export type PassingGradeType = (typeof PASSING_GRADE_TYPES)[number];

function getPassingGradeTypes(testName?: string | null) {
  return String(testName || "").toUpperCase() === "TPA"
    ? TPA_PASSING_GRADE_TYPES
    : SKD_PASSING_GRADE_TYPES;
}

function normalizePassingGradeType(type: unknown) {
  const rawType = String(type || "").trim();
  const normalizedType = rawType.toUpperCase();

  return PASSING_GRADE_TYPES.find(
    (item) => item.toUpperCase() === normalizedType
  );
}

export function defaultPassingGrades(testName?: string | null) {
  const normalizedTestName = String(testName || "").toUpperCase();

  if (normalizedTestName === "SKD") {
    return [
      { type: "TWK", minScore: 65 },
      { type: "TIU", minScore: 80 },
      { type: "TKP", minScore: 166 },
    ];
  }

  return [];
}

export function parsePassingGrades(
  value: unknown,
  testName?: string | null,
  defaultIfEmpty = true
) {
  const rows: { type: PassingGradeType; minScore: number }[] = [];
  const allowedTypes: readonly string[] = getPassingGradeTypes(testName);

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const type = normalizePassingGradeType((item as any).type);
      const minScore = Number((item as any).minScore);

      if (
        type &&
        allowedTypes.includes(type) &&
        Number.isInteger(minScore) &&
        minScore > 0
      ) {
        rows.push({ type, minScore });
      }
    }
  } else if (value && typeof value === "object") {
    for (const type of allowedTypes) {
      const minScore = Number((value as Record<string, unknown>)[type]);
      if (Number.isInteger(minScore) && minScore > 0) {
        rows.push({ type: type as PassingGradeType, minScore });
      }
    }
  }

  const uniqueRows = allowedTypes.flatMap((type) => {
    const row = rows.find((item) => item.type === type);
    return row ? [row] : [];
  });

  return uniqueRows.length || !defaultIfEmpty ? uniqueRows : defaultPassingGrades(testName);
}
