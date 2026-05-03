import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const allowedTypes = new Set([
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "WINDOW_FOCUS",
  "TAB_VISIBLE",
]);

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const attemptId = Number(body.attemptId);
  const type = String(body.type ?? "");

  if (!attemptId || !allowedTypes.has(type)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const attempt = await prismadb.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, completedAt: true },
  });

  if (!attempt || attempt.userId !== Number(session.user.id)) {
    return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
  }

  const attemptStatus = await ensureAttemptOpen(attempt.id, Number(session.user.id));

  if (attemptStatus.status === "expired") {
    return NextResponse.json(
      {
        message: "Waktu ujian sudah habis. Sesi ujian ditutup otomatis oleh sistem.",
        completed: true,
        autoSubmitted: true,
      },
      { status: 200 }
    );
  }

  if (attempt.completedAt || attemptStatus.status === "completed") {
    return NextResponse.json({ message: "Sesi ujian sudah dikumpulkan" }, { status: 409 });
  }

  await prismadb.securityEvent.create({
    data: {
      attemptId,
      userId: Number(session.user.id),
      type,
      metadata: {
        visibilityState: body.visibilityState ?? null,
        userAgent: req.headers.get("user-agent"),
        clientTime: body.clientTime ?? null,
      },
    },
  });

  await prismadb.attempt.update({
    where: { id: attemptId },
    data: { lastHeartbeatAt: new Date() },
  });

  return NextResponse.json({ saved: true }, { status: 200 });
};
