import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const GET = async() =>{
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({message: "Unauthorized"}, {status:401}) 
  }
  const userId = session.user.id;
  const userIdNumber = parseInt(userId, 10);
  const existingAttempt = await prismadb.attempt.findFirst({
    where: {
      userId: userIdNumber,
      completedAt: null,
    },
    include: {
      Package: {
        select: {
          id: true,
          title: true,
          testName: true,
          duration: true,
          tryoutOrder: true,
          questions: {
            select: { id: true },
          },
        },
      },
      responses: {
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  if (!existingAttempt) {
    return NextResponse.json({message: "Tidak ada sesi ujian aktif"}, {status:404})
  }

  const attemptStatus = await ensureAttemptOpen(existingAttempt.id, userIdNumber);

  if (attemptStatus.status === "expired") {
    return NextResponse.json({
      message: "Waktu ujian sudah habis. Jawaban otomatis dikumpulkan oleh server.",
      completed: true,
      autoSubmitted: true,
      attemptId: existingAttempt.id,
      score: attemptStatus.result?.score ?? 0,
      redirectUrl: `/hasil/${existingAttempt.id}`,
    }, {status:410})
  }

  const questionCount = Array.isArray(existingAttempt.questionOrder)
    ? existingAttempt.questionOrder.length
    : existingAttempt.Package.questions.length;

  return NextResponse.json({
    attemptId: existingAttempt.id,
    packageId: existingAttempt.Package.id,
    packageTitle: existingAttempt.Package.title,
    testName: existingAttempt.Package.testName,
    duration: existingAttempt.Package.duration,
    tryoutOrder: existingAttempt.Package.tryoutOrder,
    tryoutLabel: existingAttempt.Package.tryoutOrder
      ? `TO ${existingAttempt.Package.tryoutOrder}`
      : "TO -",
    startedAt: formatDate(existingAttempt.createdAt),
    lastActiveAt: formatDate(existingAttempt.lastHeartbeatAt),
    savedAnswers: existingAttempt.responses.length,
    totalQuestions: questionCount,
    continueUrl: `/ujian/${existingAttempt.Package.testName}/${existingAttempt.Package.id}`,
  }, {status:200})
}
