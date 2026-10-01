import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen, recordAttemptHeartbeat } from "../_attempt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const attemptId = Number(body?.attemptId);
  if (!Number.isSafeInteger(attemptId) || attemptId < 1) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  const result = await ensureAttemptOpen(attemptId, Number(session.user.id));
  if (result.status === "not_found") return NextResponse.json({ message: "Sesi tidak ditemukan." }, { status: 404 });
  if (result.status !== "open") return NextResponse.json({
    ok: true, addedPausedMs: 0, totalPausedMs: result.attempt?.totalPausedMs ?? 0,
    completed: true, autoSubmitted: result.status === "expired",
  });
  const heartbeat = await recordAttemptHeartbeat(attemptId, Number(session.user.id));
  if (!heartbeat) return NextResponse.json({ message: "Sesi tidak ditemukan." }, { status: 404 });
  if (heartbeat.completed) return NextResponse.json({ ok: true, completed: true, totalPausedMs: heartbeat.totalPausedMs });
  return NextResponse.json({
    ok: true, addedPausedMs: heartbeat.addedPausedMs, totalPausedMs: heartbeat.totalPausedMs,
    completed: false,
    message: "Jeda koneksi dihitung server sesuai batas konfigurasi sesi ujian.",
  });
}
