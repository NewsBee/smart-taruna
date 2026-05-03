import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const MAX_PAUSE_MS_PER_EVENT = 5 * 60 * 1000;

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { attemptId, pausedMs } = await req.json();
  const attemptNumber = Number(attemptId);
  const requestedPausedMs = Number(pausedMs);

  if (!attemptNumber || Number.isNaN(requestedPausedMs)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const attempt = await prismadb.attempt.findUnique({
    where: { id: attemptNumber },
    select: { id: true, userId: true, completedAt: true },
  });

  if (!attempt || attempt.userId !== Number(session.user.id)) {
    return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
  }

  const attemptStatus = await ensureAttemptOpen(attempt.id, Number(session.user.id));

  if (attemptStatus.status === "expired") {
    return NextResponse.json(
      {
        ok: true,
        completed: true,
        autoSubmitted: true,
        score: attemptStatus.result?.score ?? 0,
      },
      { status: 200 }
    );
  }

  if (attempt.completedAt || attemptStatus.status === "completed") {
    return NextResponse.json({ ok: true, completed: true }, { status: 200 });
  }

  const safePausedMs = Math.max(
    0,
    Math.min(Math.floor(requestedPausedMs), MAX_PAUSE_MS_PER_EVENT)
  );

  const updatedAttempt = await prismadb.attempt.update({
    where: { id: attemptNumber },
    data: {
      totalPausedMs: {
        increment: safePausedMs,
      },
      lastHeartbeatAt: new Date(),
    },
    select: { totalPausedMs: true },
  });

  return NextResponse.json(
    { ok: true, addedPausedMs: safePausedMs, totalPausedMs: updatedAttempt.totalPausedMs },
    { status: 200 }
  );
};
