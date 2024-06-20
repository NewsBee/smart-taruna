import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const POST = async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const body = await req.json();
  const attemptId = body.attemptId;
  const responses = body.responses;
  const attemptNumber = parseInt(attemptId, 10);
  if (!attemptNumber || !Array.isArray(responses)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    let totalScore = 0;

    // Menggunakan transaksi Prisma untuk memastikan semua operasi dilakukan dalam satu transaksi
    await prismadb.$transaction(async (tx) => {
      const responseData = [];
      const questionIds = responses.map((response: any) => parseInt(response._id, 10));

      const existingResponses = await tx.response.findMany({
        where: {
          attemptId: attemptNumber,
          questionId: { in: questionIds },
        },
      });

      const existingResponseMap = new Map(existingResponses.map((res) => [res.questionId, res]));

      for (const response of responses) {
        const questionId = parseInt(response._id, 10);
        if (isNaN(questionId) || existingResponseMap.has(questionId)) continue;

        const question = await tx.question.findUnique({
          where: { id: questionId },
          include: { Choices: true },
        });

        if (!question) continue;

        let questionScore = 0;
        if (question.type === "TKP" && response.response) {
          const selectedChoice = question.Choices.find(choice => choice.id === parseInt(response.response, 10));
          questionScore = selectedChoice ? selectedChoice.scoreValue : 0;
        } else {
          const isCorrectAnswer = question.Choices.some(choice => choice.isCorrect && choice.id === parseInt(response.response, 10));
          questionScore = isCorrectAnswer ? 5 : 0;
        }

        totalScore += questionScore;

        responseData.push({
          content: response.response,
          score: questionScore,
          questionId: questionId,
          attemptId: attemptNumber,
        });
      }

      if (responseData.length > 0) {
        await tx.response.createMany({
          data: responseData,
        });
      }

      await tx.attempt.update({
        where: { id: attemptNumber },
        data: {
          score: totalScore,
          completedAt: new Date(),
        },
      });
    }, {
      timeout: 30000 // Tambahkan parameter timeout di sini
    });

    // Pindahkan logika perhitungan persentase di luar transaksi utama
    const allQuestions = await prismadb.question.findMany({
      include: { Choices: true, responses: true },
    });

    for (const question of allQuestions) {
      const totalResponses = question.responses.length;

      for (const choice of question.Choices) {
        const choiceResponses = question.responses.filter(
          response => response.content === choice.id.toString()
        ).length;

        const percentage = totalResponses ? (choiceResponses / totalResponses) * 100 : 0;

        await prismadb.choice.update({
          where: { id: choice.id },
          data: { percentage },
        });
      }
    }

    return NextResponse.json({ score: totalScore }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
};
