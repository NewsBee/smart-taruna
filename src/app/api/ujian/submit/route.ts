import { IResponse } from "@/app/(dashboard)/shared/interfaces";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    let totalScore = 0;

    for (const response of responses) {
      const questionId = parseInt(response._id, 10);
      if (isNaN(questionId)) continue;

      const question = await prismadb.question.findUnique({
        where: { id: questionId },
        include: { Choices: true },
      });

      if (!question) continue;

      let questionScore = 0;
      if (question.type === "TPA" && response.response) {
        const selectedChoice = question.Choices.find(choice => choice.content === response.response);
        questionScore = selectedChoice ? selectedChoice.scoreValue : 0;
      } else {
        const isCorrectAnswer = question.Choices.some(choice => choice.isCorrect && choice.content === response.response);
        questionScore = isCorrectAnswer ? 5 : 0;
      }

      totalScore += questionScore;

      await prismadb.response.create({
        data: {
          content: response.response,
          score: questionScore,
          questionId: questionId,
          attemptId: attemptNumber,
        },
      });
    }

    await prismadb.attempt.update({
      where: { id: attemptNumber },
      data: {
        score: totalScore,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ score: totalScore }, { status: 200 });
  } catch (error:any) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
};
