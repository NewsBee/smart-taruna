import { Prisma } from "@prisma/client";
import { scoreAnswer } from "@/app/api/ujian/_scoring";
import { resolveExamDuration } from "@/app/lib/exam-time";
import prismadb from "@/app/lib/prismadb";
import { assignedQuestionIds, ExamError, SubmittedAnswer, validateAssignedAnswers } from "./_answers";

const SERVER_TIMER_GRACE_MS = 15000;
const configuredPauseMinutes = process.env.EXAM_MAX_OFFLINE_PAUSE_MINUTES?.trim();
const parsedPauseMinutes = configuredPauseMinutes ? Number(configuredPauseMinutes) : 5;
const safePauseMinutes = Number.isSafeInteger(parsedPauseMinutes) && parsedPauseMinutes >= 0
  ? Math.min(parsedPauseMinutes, 1440)
  : 5;
export const MAX_OFFLINE_PAUSE_MS = safePauseMinutes * 60 * 1000;
const HEARTBEAT_JITTER_MS = 15 * 1000;
const OFFLINE_DETECTION_MS = 30 * 1000;
type AttemptTiming = {
  createdAt: Date;
  totalPausedMs: number;
  lastHeartbeatAt?: Date | null;
  Package?: { duration?: number | null } | null;
};

export function getAttemptDeadline(attempt: {
  createdAt: Date;
  totalPausedMs?: number | null;
  Package?: { duration?: number | null } | null;
}) {
  return new Date(attempt.createdAt.getTime() +
    resolveExamDuration(attempt.Package?.duration) * 60000 + (attempt.totalPausedMs || 0));
}

function projectedOfflinePause(attempt: AttemptTiming, now: Date) {
  const heartbeatAt = attempt.lastHeartbeatAt ?? attempt.createdAt;
  const missingHeartbeatMs = now.getTime() - heartbeatAt.getTime();
  if (missingHeartbeatMs <= OFFLINE_DETECTION_MS) return 0;
  const remainingPauseMs = Math.max(0, MAX_OFFLINE_PAUSE_MS - (attempt.totalPausedMs || 0));
  return Math.min(remainingPauseMs, Math.max(0, missingHeartbeatMs - HEARTBEAT_JITTER_MS));
}

export function isAttemptExpired(attempt: AttemptTiming, now = new Date()) {
  const deadline = getAttemptDeadline(attempt).getTime() + projectedOfflinePause(attempt, now);
  return now.getTime() > deadline + SERVER_TIMER_GRACE_MS;
}

function reconcileOfflinePause(attempt: AttemptTiming, now: Date) {
  return projectedOfflinePause(attempt, now);
}

async function lockAttempt(tx: Prisma.TransactionClient, attemptId: number, userId?: number) {
  return tx.attempt.updateMany({
    where: { id: attemptId, userId, completedAt: null },
    data: { totalPausedMs: { increment: 0 } },
  });
}

// All answer writes and completion acquire the same attempt row lock first.
export async function finishAttempt(attemptId: number, userId?: number, responses?: SubmittedAnswer[]) {
  return prismadb.$transaction(async (tx) => {
    const locked = await lockAttempt(tx, attemptId, userId);
    const attempt = await tx.attempt.findFirst({
      where: { id: attemptId, userId },
      include: { Package: { select: { duration: true } }, responses: true },
    });
    if (!attempt) return null;
    if (!locked.count || attempt.completedAt) {
      return { attemptId, score: attempt.score ?? 0, completedAt: attempt.completedAt,
        alreadyCompleted: true, autoSubmitted: false };
    }
    if (userId !== undefined && responses !== undefined) {
      const now = new Date();
      const addedPauseMs = reconcileOfflinePause(attempt, now);
      attempt.totalPausedMs += addedPauseMs;
      attempt.lastHeartbeatAt = now;
      await tx.attempt.update({
        where: { id: attemptId },
        data: { totalPausedMs: attempt.totalPausedMs, lastHeartbeatAt: now },
      });
    }
    const expired = isAttemptExpired(attempt);
    if (responses === undefined && !expired) return null;
    if (responses === undefined && expired) {
      attempt.totalPausedMs += reconcileOfflinePause(attempt, new Date());
    }
    const ids = assignedQuestionIds(attempt.questionOrder);
    const submitted = responses && !expired ? validateAssignedAnswers(attempt.questionOrder, responses) : new Map<number, string>();
    const saved = new Map(attempt.responses.map((answer) => [answer.questionId, answer.content ?? ""]));
    const questions = await tx.question.findMany({
      where: { id: { in: ids }, packageId: attempt.packageId }, include: { Choices: true },
    });
    const rows = questions.map((question) => {
      const content = submitted.get(question.id) ?? saved.get(question.id) ?? "";
      return { questionId: question.id, attemptId, content, score: scoreAnswer(question, content) };
    });
    const score = rows.reduce((sum, row) => sum + row.score, 0);
    const completedAt = new Date();
    await tx.response.deleteMany({ where: { attemptId } });
    if (rows.length) await tx.response.createMany({ data: rows });
    await tx.attempt.update({ where: { id: attemptId }, data: {
      score, completedAt, lastHeartbeatAt: completedAt, totalPausedMs: attempt.totalPausedMs,
    } });
    if (expired) await tx.securityEvent.create({
      data: { attemptId, userId: attempt.userId, type: "AUTO_SUBMIT_TIME_EXPIRED",
        metadata: { reason: "Waktu ujian habis; jawaban yang sudah diterima server dikumpulkan." } },
    });
    return { attemptId, score, completedAt, alreadyCompleted: false, autoSubmitted: expired };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 15000 });
}

export const autoSubmitAttempt = (attemptId: number) => finishAttempt(attemptId);

export async function saveAttemptAnswer(attemptId: number, userId: number, answer: SubmittedAnswer) {
  const status = await prismadb.$transaction(async (tx) => {
    const locked = await lockAttempt(tx, attemptId, userId);
    if (!locked.count) {
      const attempt = await tx.attempt.findFirst({ where: { id: attemptId, userId } });
      if (!attempt) throw new ExamError("Sesi ujian tidak ditemukan.", 404);
      return "completed";
    }
    const attempt = await tx.attempt.findUniqueOrThrow({
      where: { id: attemptId }, include: { Package: { select: { duration: true } } },
    });
    const now = new Date();
    const addedPauseMs = reconcileOfflinePause(attempt, now);
    attempt.totalPausedMs += addedPauseMs;
    attempt.lastHeartbeatAt = now;
    await tx.attempt.update({
      where: { id: attemptId },
      data: { totalPausedMs: attempt.totalPausedMs, lastHeartbeatAt: now },
    });
    if (isAttemptExpired(attempt, now)) return "expired";
    validateAssignedAnswers(attempt.questionOrder, [answer]);
    const question = await tx.question.findFirst({
      where: { id: answer._id, packageId: attempt.packageId }, include: { Choices: true },
    });
    if (!question) throw new ExamError("Soal tidak ditemukan.", 404);
    const data = { content: answer.response, score: scoreAnswer(question, answer.response) };
    await tx.response.upsert({
      where: { attemptId_questionId: { attemptId, questionId: question.id } },
      update: data,
      create: { ...data, attemptId, questionId: question.id },
    });
    return "saved";
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
  if (status === "expired") await autoSubmitAttempt(attemptId);
  return status;
}

export async function recordAttemptHeartbeat(attemptId: number, userId: number) {
  return prismadb.$transaction(async (tx) => {
    const locked = await lockAttempt(tx, attemptId, userId);
    if (!locked.count) {
      const attempt = await tx.attempt.findFirst({ where: { id: attemptId, userId } });
      if (!attempt) return null;
      return { completed: true, totalPausedMs: attempt.totalPausedMs };
    }

    const attempt = await tx.attempt.findUniqueOrThrow({ where: { id: attemptId } });
    const now = new Date();
    const addedPauseMs = reconcileOfflinePause(attempt, now);
    const totalPausedMs = attempt.totalPausedMs + addedPauseMs;
    await tx.attempt.update({
      where: { id: attemptId },
      data: { totalPausedMs, lastHeartbeatAt: now },
    });
    return { completed: false, totalPausedMs, addedPausedMs: addedPauseMs };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}

export async function ensureAttemptOpen(attemptId: number, userId?: number) {
  const attempt = await prismadb.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      packageId: true,
      score: true,
      createdAt: true,
      completedAt: true,
      totalPausedMs: true,
      lastHeartbeatAt: true,
      Package: {
        select: {
          duration: true,
        },
      },
    },
  });

  if (!attempt || (userId && attempt.userId !== userId)) {
    return { status: "not_found" as const, attempt: null, result: null };
  }

  if (attempt.completedAt) {
    return { status: "completed" as const, attempt, result: null };
  }

  if (isAttemptExpired(attempt)) {
    const result = await autoSubmitAttempt(attempt.id);
    return { status: "expired" as const, attempt, result };
  }

  return { status: "open" as const, attempt, result: null };
}

export async function hasReachedAttemptLimit(
  userId: number,
  packageId: number,
  maxAttempts?: number | null
) {
  const limit = maxAttempts && maxAttempts > 0 ? maxAttempts : 1;
  const attemptCount = await prismadb.attempt.count({
    where: {
      userId,
      packageId,
    },
  });

  return {
    reached: attemptCount >= limit,
    attemptCount,
    limit,
  };
}
