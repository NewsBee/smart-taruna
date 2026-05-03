import { IResponse } from "@/app/(dashboard)/shared/interfaces";
import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import { scoreAnswer } from "@/app/api/ujian/_scoring";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  // const userId = session.user.id;
  const body = await req.json();
  const attemptId = body.attemptId;
  const responses = body.responses;
  const attemptNumber = parseInt(attemptId, 10);
  if (!attemptNumber || !Array.isArray(responses)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  
  try {
    const attempt = await prismadb.attempt.findUnique({
      where: { id: attemptNumber },
      select: { id: true, userId: true, packageId: true, completedAt: true },
    });

    if (!attempt || attempt.userId !== Number(session.user.id)) {
      return NextResponse.json({ message: "Sesi ujian tidak ditemukan" }, { status: 404 });
    }

    const attemptStatus = await ensureAttemptOpen(attempt.id, Number(session.user.id));

    if (attemptStatus.status === "expired") {
      return NextResponse.json(
        {
          score: attemptStatus.result?.score ?? 0,
          autoSubmitted: true,
          message: "Waktu ujian sudah habis. Jawaban tersimpan dikumpulkan otomatis oleh server.",
        },
        { status: 200 }
      );
    }

    if (attempt.completedAt || attemptStatus.status === "completed") {
      return NextResponse.json(
        { message: "Sesi ujian sudah dikumpulkan", score: null },
        { status: 409 }
      );
    }

    const responseByQuestionId = new Map<number, string>();
    for (const response of responses) {
      const questionId = parseInt(response._id, 10);
      if (!Number.isNaN(questionId)) {
        responseByQuestionId.set(questionId, String(response.response ?? ""));
      }
    }

    const questionIds = Array.from(responseByQuestionId.keys());
    const questions = await prismadb.question.findMany({
      where: {
        id: { in: questionIds },
        packageId: attempt.packageId,
      },
      include: { Choices: true },
    });

    const responseRows = questions.map((question) => {
      const content = responseByQuestionId.get(question.id) ?? "";
      const score = scoreAnswer(question, content);
      return {
        content,
        score,
        questionId: question.id,
        attemptId: attemptNumber,
      };
    });

    const totalScore = responseRows.reduce((sum, row) => sum + row.score, 0);

    await prismadb.$transaction([
      prismadb.response.deleteMany({
        where: { attemptId: attemptNumber },
      }),
      ...(responseRows.length
        ? [
            prismadb.response.createMany({
              data: responseRows,
            }),
          ]
        : []),
      prismadb.attempt.update({
        where: { id: attemptNumber },
        data: {
          score: totalScore,
          completedAt: new Date(),
          lastHeartbeatAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ score: totalScore }, { status: 200 });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
};
