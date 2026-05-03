import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import { scoreAnswer } from "@/app/api/ujian/_scoring";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const attemptId = Number(body.attemptId);
  const questionId = Number(body.questionId);
  const content = String(body.response ?? "");

  if (!attemptId || !questionId) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const attempt = await prismadb.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, userId: true, packageId: true, completedAt: true },
  });

  if (!attempt || attempt.userId !== Number(session.user.id)) {
    return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
  }

  const attemptStatus = await ensureAttemptOpen(attempt.id, Number(session.user.id));

  if (attemptStatus.status === "expired") {
    return NextResponse.json(
      {
        message: "Waktu ujian sudah habis. Jawaban otomatis dikumpulkan oleh server.",
        completed: true,
        autoSubmitted: true,
        score: attemptStatus.result?.score ?? 0,
      },
      { status: 409 }
    );
  }

  if (attempt.completedAt || attemptStatus.status === "completed") {
    return NextResponse.json(
      { message: "Sesi ujian sudah dikumpulkan" },
      { status: 409 }
    );
  }

  const question = await prismadb.question.findUnique({
    where: { id: questionId },
    include: { Choices: true },
  });

  if (!question || question.packageId !== attempt.packageId) {
    return NextResponse.json({ message: "Question not found" }, { status: 404 });
  }

  const score = scoreAnswer(question, content);

  await prismadb.$transaction([
    prismadb.response.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        content,
        score,
      },
      create: {
        attemptId,
        questionId,
        content,
        score,
      },
    }),
    prismadb.attempt.update({
      where: { id: attemptId },
      data: { lastHeartbeatAt: new Date() },
    }),
  ]);

  return NextResponse.json({ saved: true, score }, { status: 200 });
};
