export const PASSING_GRADE_TYPES = ["TWK", "TIU", "TKP"] as const;

export type PassingGradeType = (typeof PASSING_GRADE_TYPES)[number];

export function defaultPassingGrades(testName?: string | null) {
  const normalizedTestName = String(testName || "").toUpperCase();

  if (normalizedTestName === "SKD") {
    return [
      { type: "TWK", minScore: 65 },
      { type: "TIU", minScore: 80 },
      { type: "TKP", minScore: 166 },
    ];
  }

  if (normalizedTestName === "TKP") {
    return [{ type: "TKP", minScore: 166 }];
  }

  return [];
}

export function parsePassingGrades(
  value: unknown,
  testName?: string | null,
  defaultIfEmpty = true
) {
  const rows: { type: PassingGradeType; minScore: number }[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const type = String((item as any).type || "").toUpperCase();
      const minScore = Number((item as any).minScore);

      if (
        PASSING_GRADE_TYPES.includes(type as PassingGradeType) &&
        Number.isInteger(minScore) &&
        minScore > 0
      ) {
        rows.push({ type: type as PassingGradeType, minScore });
      }
    }
  } else if (value && typeof value === "object") {
    for (const type of PASSING_GRADE_TYPES) {
      const minScore = Number((value as Record<string, unknown>)[type]);
      if (Number.isInteger(minScore) && minScore > 0) {
        rows.push({ type, minScore });
      }
    }
  }

  const uniqueRows = PASSING_GRADE_TYPES.flatMap((type) => {
    const row = rows.find((item) => item.type === type);
    return row ? [row] : [];
  });

  return uniqueRows.length || !defaultIfEmpty ? uniqueRows : defaultPassingGrades(testName);
}
