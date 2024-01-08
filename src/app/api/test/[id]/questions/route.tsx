import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

interface Option {
  content: string;
  isCorrect: boolean;
  scoreValue: number;
}

export const GET = async (
  req: NextRequest,
  context: { params: { id: any } }
) => {
  const packageId = context.params.id;
  // const testWithQuestions = await prismadb.test.findUnique({
  //   where: {
  //     id: parseInt(testId),
  //   },
  //   include: {
  //     questions: {
  //       include: {
  //         choices: true, // Mengikutsertakan choices
  //       },
  //     },
  //   },
  // });

  const packageWithQuestions = await prismadb.package.findUnique({
    where: {
      id: parseInt(packageId),
    },
    include: {
      questions: {
        include: {
          Choices: true, // Mengikutsertakan pilihan jawaban
        },
      },
      Test: true, // Mengikutsertakan data Test
    },
  });

  if (packageWithQuestions) {
    // Transformasi data untuk response
    const transformedData = {
      packageId: packageWithQuestions.id,
      title: packageWithQuestions.title,
      testName: packageWithQuestions.Test.name,
      questions: packageWithQuestions.questions.map((question) => ({
        id: question.id,
        content: question.content,
        type: question.type,
        image: question.image,
        explanation: question.explanation,
        choices: question.Choices.map((choice) => ({
          id: choice.id,
          content: choice.content,
          isCorrect: choice.isCorrect,
        })),
      })),
    };

    return NextResponse.json(transformedData);
  } else {
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
};

export async function POST(req: Request) {
  const body = await req.json();
  const { content, type, packageId, options, explanation } = body;
  try {
    const question = await prismadb.question.create({
      data: {
        content,
        type,
        packageId,
        explanation,
        Choices: {
          create: options.map((option: Option) => ({
            content: option.content,
            isCorrect: option.isCorrect,
            scoreValue: option.scoreValue,
          })),
        },
      },
    });

    return NextResponse.json({ question }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export const DELETE = async (req: Request) => {
  const body = await req.json();
  const { id } = body;

  try {
    // Opsional: Periksa dulu apakah record pertanyaan tersebut ada
    const question = await prismadb.question.findUnique({
      where: { id: parseInt(id) },
    });

    if (!question) {
      return NextResponse.json({ message: "Question not found" }, { status: 404 });
    }

    // Jika ada, lanjutkan proses penghapusan
    const deletedQuestion = await prismadb.question.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({message: "Quiz berhasil dihapus", deletedQuestion}, {status:200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
  }
};

