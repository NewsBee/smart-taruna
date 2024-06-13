import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface Choice {
  id: number;
  content: string;
  isCorrect: boolean;
  scoreValue: number;
  image : string;
}

interface Option {
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

export const PUT = async (
  req: NextRequest,
  context: { params: { id: any } }
) => {
  const questionId = context.params.id;
  const { content, type, explanation, Choices, image } = await req.json();

  try {
    // Memperbarui setiap pilihan secara individual
    await Promise.all(Choices.map(async (choice: Choice) => {
      const isCorrect = type === "TKP" ? true : choice.isCorrect;
      const scoreValue = type === "TKP" ? choice.scoreValue : choice.isCorrect ? 5 : 0;

      await prismadb.choice.update({
        where: { id: choice.id },
        data: {
          content: choice.content,
          isCorrect: isCorrect,
          scoreValue: scoreValue,
          image: choice.image === "" ? null : choice.image, // Mengatur gambar menjadi null jika dihapus
        },
      });
    }));

    const updatedQuestion = await prismadb.question.update({
      where: { id: parseInt(questionId) },
      data: {
        content,
        type,
        explanation,
        image: image === "" ? null : image, // Mengatur gambar menjadi null jika dihapus
      },
    });

    return NextResponse.json({ updatedQuestion }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
};
