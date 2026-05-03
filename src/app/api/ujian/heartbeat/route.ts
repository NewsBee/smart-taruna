import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await req.json();
  const attemptNumber = Number(attemptId);

  if (!attemptNumber) {
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

  await prismadb.attempt.update({
    where: { id: attemptNumber },
    data: { lastHeartbeatAt: new Date() },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
};
