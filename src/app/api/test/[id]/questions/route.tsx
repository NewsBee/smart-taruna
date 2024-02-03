import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
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
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({message: "Unauthorized"}, {status:401}) 
  }
  const userId = parseInt(session.user.id, 10)
  // const userIdNumber = parseInt(userId, 10);
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
      attempts: {
        where: {
          userId: userId, // Hanya mengambil attempt yang relevan dengan user
        },
        orderBy: {
          createdAt: 'desc', // Mengambil attempt terbaru
        },
        take: 1, // Hanya mengambil satu attempt teratas
      },
    },
  });

  if (packageWithQuestions) {
    const attempt = packageWithQuestions.attempts[0];
    // Transformasi data untuk response
    const transformedData = {
      packageId: packageWithQuestions.id,
      title: packageWithQuestions.title,
      testName: packageWithQuestions.Test.name,
      duration: packageWithQuestions.duration,
      createdAt: attempt ? attempt.createdAt : null,
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

export async function POST(req: Request, context: { params: { id: any } }) {
  const packageId = context.params.id;
  const { content, type, explanation, Choices } = await req.json();
  try {
    // Create a new question
    const newQuestion = await prismadb.question.create({
      data: {
        content,
        type,
        explanation,
        packageId : parseInt(packageId), // Ensure packageId is provided and valid
        Choices: {
          createMany: {
            data: Choices.map((choice: Option) => ({
              content: choice.content,
              isCorrect: choice.isCorrect,
              scoreValue: choice.scoreValue,
            })),
          },
        },
      },
    });

    return NextResponse.json({ newQuestion }, { status: 201 });
  } catch (error: any) {
    // console.error("Error creating package:", error);
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
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    // Jika ada, lanjutkan proses penghapusan
    const deletedQuestion = await prismadb.question.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Quiz berhasil dihapus", deletedQuestion },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
};
