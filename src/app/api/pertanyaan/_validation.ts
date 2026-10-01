import { z } from "zod";

const choiceSchema = z.object({
  id: z.number().int().positive().optional(),
  content: z.string().trim().min(1).max(10000),
  isCorrect: z.boolean(),
  scoreValue: z.coerce.number().int().min(0).max(5).optional().default(0),
});

export const questionSchema = z.object({
  content: z.string().trim().min(1).max(20000),
  type: z.string().trim().min(1).max(50),
  answerType: z.enum(["MULTIPLE_CHOICE", "SCORED_CHOICE", "SHORT_TEXT", "NUMERIC"]).default("MULTIPLE_CHOICE"),
  correctAnswer: z.string().max(10000).nullish(),
  tolerance: z.coerce.number().finite().nonnegative().nullish(),
  explanation: z.string().max(20000).nullish(),
  image: z.string().max(2048).nullish(),
  explanationImage: z.string().max(2048).nullish(),
  // Input questions can contain empty, unused options from the shared form.
  Choices: z.array(z.unknown()).max(20).default([]),
}).transform((question, ctx) => {
  const input = question.answerType === "SHORT_TEXT" || question.answerType === "NUMERIC";
  const scored = question.answerType === "SCORED_CHOICE" || question.type === "TKP";
  if (input && !question.correctAnswer?.trim()) ctx.addIssue({ code: "custom", message: "Kunci jawaban wajib diisi." });
  if (question.answerType === "NUMERIC" && !Number.isFinite(Number(question.correctAnswer?.replace(",", ".")))) {
    ctx.addIssue({ code: "custom", message: "Kunci jawaban harus berupa angka." });
  }
  const parsed = z.array(choiceSchema).min(2).safeParse(question.Choices);
  const choices = input ? [] : parsed.success ? parsed.data : [];
  if (!input && !parsed.success) ctx.addIssue({ code: "custom", message: "Isi minimal dua pilihan beserta nilainya." });
  if (!input && !scored && choices.filter((choice) => choice.isCorrect).length !== 1) {
    ctx.addIssue({ code: "custom", message: "Pilih tepat satu jawaban benar." });
  }
  if (new Set(choices.map((choice) => choice.content)).size !== choices.length) {
    ctx.addIssue({ code: "custom", message: "Isi pilihan jawaban tidak boleh sama." });
  }
  const ids = choices.flatMap((choice) => choice.id ? [choice.id] : []);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "ID pilihan tidak boleh berulang." });
  return {
    ...question,
    correctAnswer: input ? question.correctAnswer?.trim() : null,
    tolerance: question.answerType === "NUMERIC" ? question.tolerance ?? 0 : null,
    Choices: choices.map((choice) => ({ ...choice, isCorrect: scored || choice.isCorrect,
      scoreValue: scored ? choice.scoreValue : choice.isCorrect ? 5 : 0 })),
  };
});

export function planChoiceUpdates(choices: z.output<typeof questionSchema>["Choices"]) {
  return {
    deleteMany: { id: { notIn: choices.flatMap((choice) => choice.id ? [choice.id] : []) } },
    updateMany: choices.filter((choice) => choice.id).map(({ id, ...data }) => ({ where: { id }, data })),
    create: choices.filter((choice) => !choice.id).map(({ id, ...data }) => data),
  };
}
