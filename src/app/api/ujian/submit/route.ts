import { IResponse } from "@/app/(dashboard)/shared/interfaces";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions);
  // if (!session) {
  //   return new NextResponse("Unauthorized", { status: 403 });
  // }
  // const userId = session.user.id;
  const body = await req.json();
  const attemptId = body.attemptId;
  const responses = body.responses;
  const attemptNumber = parseInt(attemptId, 10);
  if (!attemptNumber || !Array.isArray(responses)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  try {
    let score = 0;

    for (const response of responses) {
      const questionId = parseInt(response._id , 10);
      if (isNaN(questionId)) continue;

      const question = await prismadb.question.findUnique({
        where: { id: questionId },
        include: { Choices: true },
      });

      if (!question) {
        continue;
      }

      const correctChoice = question.Choices.find((choice) => choice.isCorrect);
      const isCorrectAnswer =
        correctChoice && correctChoice.content === response.response;

      // Tetapkan nilai default untuk scoreValue jika undefined
      const correctChoiceScoreValue = correctChoice?.scoreValue || 0;
      const questionScore =
        question.type === "TPA"
          ? correctChoiceScoreValue
          : isCorrectAnswer
          ? 5
          : 0;
      score += questionScore;

      await prismadb.response.create({
        data: {
          content: response.response,
          score: questionScore,
          questionId: questionId,
          attemptId: attemptNumber,
        },
      });
    }

    const checkBeforeUpdate = await prismadb.attempt.findUnique({
      where:{
        id:attemptNumber
      }
    })
    if(checkBeforeUpdate?.completedAt){
      return NextResponse.json({ message:"Anda telah menyelesaikan ujian ini" }, { status: 400 });
    }

    // Update skor dan tandai Attempt sebagai selesai
    await prismadb.attempt.update({
      where: { id: attemptNumber },
      data: {
        score: score,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ score }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" , eror: error},
      { status: 500 }
    );
  }
};
