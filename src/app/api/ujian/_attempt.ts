import { scoreAnswer } from "@/app/api/ujian/_scoring";
import { resolveExamDuration } from "@/app/lib/exam-time";
import prismadb from "@/app/lib/prismadb";

const SERVER_TIMER_GRACE_MS = 1500;

type AttemptTiming = {
  id: number;
  userId: number;
  packageId: number;
  score: number | null;
  createdAt: Date;
  completedAt: Date | null;
  totalPausedMs: number;
  Package: {
    duration: number | null;
  };
};

export function getAttemptDeadline(attempt: {
  createdAt: Date;
  totalPausedMs?: number | null;
  Package?: { duration?: number | null } | null;
}) {
  const duration = resolveExamDuration(attempt.Package?.duration);

  return new Date(
    attempt.createdAt.getTime() + duration * 60000 + (attempt.totalPausedMs || 0)
  );
}

export function isAttemptExpired(attempt: AttemptTiming, now = new Date()) {
  const deadline = getAttemptDeadline(attempt);
  if (!deadline) return false;

  return now.getTime() > deadline.getTime() + SERVER_TIMER_GRACE_MS;
}

export async function autoSubmitAttempt(attemptId: number) {
  const attempt = await prismadb.attempt.findUnique({
    where: { id: attemptId },
    include: {
      Package: {
        select: {
          duration: true,
        },
      },
      responses: {
        include: {
          Question: {
            include: {
              Choices: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) return null;

  if (attempt.completedAt) {
    return {
      attemptId: attempt.id,
      score: attempt.score ?? 0,
      completedAt: attempt.completedAt,
      alreadyCompleted: true,
      autoSubmitted: false,
    };
  }

  const responseScores = attempt.responses.map((response) => ({
    id: response.id,
    score: scoreAnswer(response.Question, response.content),
  }));
  const totalScore = responseScores.reduce((sum, response) => sum + response.score, 0);
  const completedAt = new Date();

  const transaction = [
    ...responseScores.map((response) =>
      prismadb.response.update({
        where: { id: response.id },
        data: { score: response.score },
      })
    ),
    prismadb.attempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        completedAt,
        lastHeartbeatAt: completedAt,
      },
    }),
    prismadb.securityEvent.create({
      data: {
        attemptId: attempt.id,
        userId: attempt.userId,
        type: "AUTO_SUBMIT_TIME_EXPIRED",
        metadata: {
          reason: "Waktu ujian habis dan sesi ujian ditutup otomatis oleh sistem",
        },
      },
    }),
  ];

  await prismadb.$transaction(transaction);

  return {
    attemptId: attempt.id,
    score: totalScore,
    completedAt,
    alreadyCompleted: false,
    autoSubmitted: true,
  };
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
