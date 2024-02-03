import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface Choice {
    id: number;
    content: string;
    isCorrect: boolean;
    scoreValue: number;
  }
  

export const GET = async (
  req: NextRequest,
  context: { params: { id: any } }
) => {
  const quizId = context.params.id;

  const quiz = await prismadb.question.findUnique({
    where: {
      id: parseInt(quizId),
    },
    include: {
      Choices: true,
    },
  });

  if (quiz) {
    return NextResponse.json(quiz);
  } else {
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest, context: { params: { id: any } }) => {
    const questionId = context.params.id;
    const { content, type, explanation, Choices } = await req.json();

  try {
    const updatedQuestion = await prismadb.question.update({
        where: { id: parseInt(questionId) },
        data: {
          content,
          type,
          // image,
          explanation,
          Choices: {
            updateMany: Choices.map((choice:Choice) => ({
              where: { id:  choice.id },
              data: { content: choice.content, isCorrect: choice.isCorrect, scoreValue: type !== "TPA" && choice.isCorrect ? 5 : choice.scoreValue }
            }))
          }
        }
      });
      return NextResponse.json({ updatedQuestion }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message:"Internal Server Error", error }, { status: 500 });
  }

//   const updatedQuestion = await prismadb.question.findByIdAndUpdate(
//     id,
//     { title, correct, options },
//     { new: true }
//   );
//   if (updatedQuestion) {
//     return NextResponse.json({ updatedQuestion }, { status: 200 });
//   } else {
//     return NextResponse.json({ message:"Internal Server Error" }, { status: 500 });
//   }
};
