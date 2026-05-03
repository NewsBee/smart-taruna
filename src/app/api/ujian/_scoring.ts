type Choice = {
  content: string;
  isCorrect: boolean;
  scoreValue: number;
};

type QuestionForScoring = {
  type: string;
  answerType?: string | null;
  correctAnswer?: string | null;
  tolerance?: number | null;
  Choices: Choice[];
};

export function normalizeTextAnswer(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function parseNumericAnswer(value: unknown) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!normalized) return Number.NaN;
  return Number(normalized);
}

export function scoreAnswer(question: QuestionForScoring, answer: unknown) {
  const response = String(answer ?? "").trim();
  if (!response) return 0;

  if (question.answerType === "NUMERIC") {
    const expected = parseNumericAnswer(question.correctAnswer);
    const actual = parseNumericAnswer(response);
    const tolerance = question.tolerance ?? 0;

    if (Number.isNaN(expected) || Number.isNaN(actual)) return 0;
    return Math.abs(actual - expected) <= tolerance ? 5 : 0;
  }

  if (question.answerType === "SHORT_TEXT") {
    return normalizeTextAnswer(response) === normalizeTextAnswer(question.correctAnswer)
      ? 5
      : 0;
  }

  if (question.type === "TKP" || question.answerType === "SCORED_CHOICE") {
    const selectedChoice = question.Choices.find(
      (choice) => choice.content === response
    );
    return selectedChoice ? selectedChoice.scoreValue : 0;
  }

  const isCorrectAnswer = question.Choices.some(
    (choice) => choice.isCorrect && choice.content === response
  );
  return isCorrectAnswer ? 5 : 0;
}
