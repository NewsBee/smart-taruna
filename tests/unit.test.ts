import assert from "node:assert/strict";
import { test } from "node:test";
import { acknowledgeDraft, examDraftKey, parseExamDraft } from "../src/app/lib/exam-draft";
import { assignedQuestionIds, submitSchema, validateAssignedAnswers } from "../src/app/api/ujian/_answers";
import { planChoiceUpdates, questionSchema } from "../src/app/api/pertanyaan/_validation";
import { resolveUploadPath, uploadImageLocally } from "../src/app/lib/local-upload";

test("answers reject other session questions even within the same package", () => {
  assert.throws(() => validateAssignedAnswers([1, 2], [{ _id: 3, response: "A" }]), /tidak termasuk/);
  assert.throws(() => validateAssignedAnswers([], [{ _id: 1, response: "A" }]), /Muat ulang/);
});
test("duplicate and oversized answer payloads are rejected", () => {
  assert.throws(() => validateAssignedAnswers([1], [{ _id: 1, response: "A" }, { _id: 1, response: "B" }]), /berulang/);
  assert.equal(submitSchema.safeParse({ attemptId: 1, responses: [{ _id: 1, response: "a".repeat(10001) }] }).success, false);
  assert.equal(assignedQuestionIds(Array.from({ length: 120 }, (_, i) => i + 1)).length, 110);
});
test("clearing an answer survives validation and browser draft restore", () => {
  assert.equal(validateAssignedAnswers([1], [{ _id: 1, response: "" }]).get(1), "");
  assert.equal(parseExamDraft('{"1":{"value":"","revision":"new"}}')[1].value, "");
});
test("an old acknowledgement cannot delete a newer unsent answer", () => {
  const draft = { "1": { value: "B", revision: "new" } };
  acknowledgeDraft(draft, "1", "old");
  assert.equal(draft[1].value, "B");
  acknowledgeDraft(draft, "1", "new");
  assert.deepEqual(draft, {});
});
test("drafts isolate accounts and sessions, and ignore malformed storage", () => {
  assert.notEqual(examDraftKey(1, 1), examDraftKey(2, 1));
  assert.notEqual(examDraftKey(1, 1), examDraftKey(1, 2));
  for (const value of [null, "not-json", "[]", "null", '{"__proto__":{"value":"x","revision":"1"}}']) {
    assert.deepEqual(parseExamDraft(value), {});
  }
});
const question = { content: "Test", type: "TIU", answerType: "MULTIPLE_CHOICE",
  Choices: [{ content: "A", isCorrect: true, scoreValue: 5 }, { content: "B", isCorrect: false, scoreValue: 0 }] };
test("converting input to multiple choice creates options without IDs", () => {
  const result = planChoiceUpdates(questionSchema.parse(question).Choices);
  assert.equal(result.create.length, 2);
  assert.deepEqual(result.updateMany, []);
});
test("converting to input deletes choices and requires a valid answer", () => {
  const result = questionSchema.parse({ ...question, answerType: "NUMERIC", correctAnswer: "3,5", tolerance: 0.1 });
  assert.deepEqual(result.Choices, []);
  assert.deepEqual(planChoiceUpdates(result.Choices).deleteMany, { id: { notIn: [] } });
  assert.equal(questionSchema.safeParse({ ...question, answerType: "NUMERIC", correctAnswer: "bad" }).success, false);
});
test("editing choices updates retained IDs, creates new choices and removes omitted IDs", () => {
  const result = planChoiceUpdates(questionSchema.parse({ ...question, Choices: [{ ...question.Choices[0], id: 10 }, question.Choices[1]] }).Choices);
  assert.deepEqual(result.deleteMany, { id: { notIn: [10] } });
  assert.equal(result.create.length, 1);
  assert.equal(result.updateMany[0].where.id, 10);
});
test("scored choices accept numeric form strings and reject invalid scores", () => {
  const value = { ...question, answerType: "SCORED_CHOICE", Choices: question.Choices.map((c) => ({ ...c, scoreValue: "3" })) };
  assert.equal(questionSchema.parse(value).Choices[0].scoreValue, 3);
  assert.equal(questionSchema.safeParse({ ...value, Choices: [{ ...value.Choices[0], scoreValue: 100 }, value.Choices[1]] }).success, false);
});
test("uploads reject path traversal and invalid images before writing", async () => {
  for (const name of ["../.env", "profile/1/../../.env", "C:\\Windows\\secret", "profile/1/image.svg"]) {
    assert.throws(() => resolveUploadPath(name));
  }
  await assert.rejects(uploadImageLocally(new Blob(["<svg/>"], { type: "image/svg+xml" }), "profile/1"), /INVALID_IMAGE_TYPE/);
  await assert.rejects(uploadImageLocally(new Blob(["bad png"], { type: "image/png" }), "profile/1"), /INVALID_IMAGE_TYPE/);
  await assert.rejects(uploadImageLocally(new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }), "profile/1"), /IMAGE_TOO_LARGE/);
});
