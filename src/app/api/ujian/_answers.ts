import { z } from "zod";
import { EXAM_QUESTION_LIMIT, parseNumberArray } from "./_security";

export const answerSchema = z.object({
  _id: z.coerce.number().int().positive(),
  response: z.string().max(10000),
});
export const submitSchema = z.object({
  attemptId: z.coerce.number().int().positive(),
  responses: z.array(answerSchema).max(EXAM_QUESTION_LIMIT),
});
export type SubmittedAnswer = z.output<typeof answerSchema>;

export class ExamError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function assignedQuestionIds(order: unknown) {
  return Array.from(new Set(parseNumberArray(order).filter((id) => id > 0))).slice(0, EXAM_QUESTION_LIMIT);
}

export function validateAssignedAnswers(order: unknown, responses: SubmittedAnswer[]) {
  const assigned = new Set(assignedQuestionIds(order));
  if (!assigned.size) throw new ExamError("Muat ulang soal untuk menyiapkan sesi ujian.", 409);
  const answers = new Map<number, string>();
  for (const response of responses) {
    if (!assigned.has(response._id)) throw new ExamError("Soal tidak termasuk sesi ujian ini.", 403);
    if (answers.has(response._id)) throw new ExamError("Jawaban soal tidak boleh berulang.");
    answers.set(response._id, response.response);
  }
  return answers;
}
