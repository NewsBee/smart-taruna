import { randomInt } from "crypto";

export const EXAM_QUESTION_LIMIT = 110;

export const normalizeExamToken = (token: unknown) =>
  String(token ?? "").trim().toUpperCase();

export const generateExamToken = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";

  for (let index = 0; index < 8; index += 1) {
    token += alphabet[randomInt(0, alphabet.length)];
  }

  return token;
};

export const shuffleIds = <T extends { id: number }>(items: T[]) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.map((item) => item.id);
};

export const createQuestionOrder = <T extends { id: number }>(items: T[]) =>
  shuffleIds(items).slice(0, EXAM_QUESTION_LIMIT);

export const createChoiceOrder = <T extends { id: number; Choices: { id: number }[] }>(
  questions: T[],
  questionOrder: number[]
) => {
  const selectedQuestions = new Set(questionOrder);

  return questions.reduce<Record<string, number[]>>((acc, question) => {
    if (selectedQuestions.has(question.id)) {
      acc[question.id.toString()] = shuffleIds(question.Choices);
    }

    return acc;
  }, {});
};

export const parseNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));
};

export const parseChoiceOrder = (value: unknown): Record<string, number[]> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, number[]>>(
    (acc, [questionId, choiceIds]) => {
      acc[questionId] = parseNumberArray(choiceIds);
      return acc;
    },
    {}
  );
};
