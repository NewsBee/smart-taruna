import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface Choice {
  id: number;
  content: string;
  isCorrect: boolean;
  scoreValue: number;
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
  const { content, type, explanation, Choices } = await req.json();

  try {
    const updateManyChoices = Choices.map((choice: Choice) => {
      // Logika untuk menentukan isCorrect dan scoreValue berdasarkan tipe soal
      const isCorrect = type === "TKP" ? true : choice.isCorrect; // Semua choice dianggap benar untuk TKP
      const scoreValue =
        type === "TKP" ? choice.scoreValue : choice.isCorrect ? 5 : 0; // Gunakan scoreValue dari frontend untuk TKP, atau tetapkan 5 jika benar dan 0 jika salah untuk tipe lain

      return {
        where: { id: choice.id },
        data: {
          content: choice.content,
          isCorrect: isCorrect,
          scoreValue: scoreValue,
        },
      };
    });

    const updatedQuestion = await prismadb.question.update({
      where: { id: parseInt(questionId) },
      data: {
        content,
        type,
        explanation,
        Choices: {
          updateMany: updateManyChoices,
        },
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
