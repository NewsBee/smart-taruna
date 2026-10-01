import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen, recordAttemptHeartbeat } from "@/app/api/ujian/_attempt";
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

  const attemptStatus = await ensureAttemptOpen(attemptNumber, Number(session.user.id));

  if (attemptStatus.status === "not_found") {
    return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
  }

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

  if (attemptStatus.status === "completed") {
    return NextResponse.json({ ok: true, completed: true }, { status: 200 });
  }

  const heartbeat = await recordAttemptHeartbeat(attemptNumber, Number(session.user.id));
  if (!heartbeat) return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
  if (heartbeat.completed) return NextResponse.json({ ok: true, completed: true }, { status: 200 });
  return NextResponse.json({ ok: true, ...heartbeat }, { status: 200 });
};
