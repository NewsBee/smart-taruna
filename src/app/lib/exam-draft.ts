export type DraftAnswer = { value: string; revision: string };
export type ExamDraft = Record<string, DraftAnswer>;

export const examDraftKey = (userId: number, attemptId: number) => `smarttaruna:exam:${userId}:${attemptId}`;

export function parseExamDraft(raw: string | null): ExamDraft {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, value]) =>
      /^[1-9]\d*$/.test(id) && value && typeof value === "object" &&
      typeof value.value === "string" && value.value.length <= 10000 && typeof value.revision === "string"));
  } catch { return {}; }
}

export function acknowledgeDraft(draft: ExamDraft, id: string, revision: string) {
  if (draft[id]?.revision === revision) delete draft[id];
}
