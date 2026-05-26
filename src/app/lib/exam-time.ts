export const DEFAULT_EXAM_DURATION_MINUTES = 120;

export function resolveExamDuration(duration?: number | null) {
  return Number.isInteger(duration) && Number(duration) > 0
    ? Number(duration)
    : DEFAULT_EXAM_DURATION_MINUTES;
}
