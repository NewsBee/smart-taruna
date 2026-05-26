import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import {
  createChoiceOrder,
  createQuestionOrder,
  EXAM_QUESTION_LIMIT,
  parseChoiceOrder,
  parseNumberArray,
} from "@/app/api/ujian/_security";
import prismadb from "@/app/lib/prismadb";
import { resolveExamDuration } from "@/app/lib/exam-time";
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
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = parseInt(session.user.id, 10);
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

  const packageNumber = parseInt(packageId, 10);
  const [packageWithQuestions, attempt] = await Promise.all([
    prismadb.package.findUnique({
      where: {
        id: packageNumber,
      },
      select: {
        id: true,
        title: true,
        duration: true,
        deletedAt: true,
        Test: {
          select: {
            name: true,
          },
        },
        questions: {
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          content: true,
          type: true,
          answerType: true,
          correctAnswer: true,
          tolerance: true,
          image: true,
          explanation: true,
          explanationImage: true,
          Choices: {
            orderBy: {
              id: "asc",
            },
            select: {
              id: true,
              content: true,
              isCorrect: true,
              scoreValue: true,
            },
          },
        },
      },
      },
    }),
    prismadb.attempt.findFirst({
      where: {
        userId,
        packageId: packageNumber,
        completedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        totalPausedMs: true,
        questionOrder: true,
        choiceOrder: true,
      },
    }),
  ]);

  if (packageWithQuestions) {
    if (packageWithQuestions.deletedAt && session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Paket sudah tidak tersedia" },
        { status: 410 }
      );
    }

    const resolvedDuration = resolveExamDuration(packageWithQuestions.duration);

    if (session.user.role === "admin") {
      return NextResponse.json({
        packageId: packageWithQuestions.id,
        attemptId: null,
        title: packageWithQuestions.title,
        testName: packageWithQuestions.Test.name,
        duration: resolvedDuration,
        createdAt: null,
        totalPausedMs: 0,
        questions: packageWithQuestions.questions.map((question) => ({
          id: question.id,
          content: question.content,
          type: question.type,
          answerType: question.answerType,
          correctAnswer: question.correctAnswer,
          tolerance: question.tolerance,
          image: question.image,
          explanation: question.explanation,
          explanationImage: question.explanationImage,
          savedResponse: "",
          choices: question.Choices.map((choice) => ({
            id: choice.id,
            content: choice.content,
            isCorrect: choice.isCorrect,
            scoreValue: choice.scoreValue,
          })),
        })),
      });
    }

    if (!attempt) {
      return NextResponse.json(
        { message: "Mulai ujian dan masukkan token terlebih dahulu." },
        { status: 403 }
      );
    }

    const attemptStatus = await ensureAttemptOpen(attempt.id, userId);

    if (attemptStatus.status === "expired") {
      return NextResponse.json(
        {
          message: "Waktu ujian sudah habis. Jawaban otomatis dikumpulkan oleh server.",
          completed: true,
          autoSubmitted: true,
          attemptId: attempt.id,
          score: attemptStatus.result?.score ?? 0,
          redirectUrl: `/hasil/${attempt.id}`,
        },
        { status: 410 }
      );
    }

    if (attemptStatus.status === "completed") {
      return NextResponse.json(
        {
          message: "Ujian sudah selesai.",
          completed: true,
          attemptId: attempt.id,
          redirectUrl: `/hasil/${attempt.id}`,
        },
        { status: 410 }
      );
    }

    let questionOrder = parseNumberArray(attempt.questionOrder);
    let choiceOrder = parseChoiceOrder(attempt.choiceOrder);

    if (questionOrder.length === 0) {
      questionOrder = createQuestionOrder(packageWithQuestions.questions);
    } else if (questionOrder.length > EXAM_QUESTION_LIMIT) {
      questionOrder = questionOrder.slice(0, EXAM_QUESTION_LIMIT);
    }

    if (Object.keys(choiceOrder).length === 0) {
      choiceOrder = createChoiceOrder(packageWithQuestions.questions, questionOrder);
    }

    if (
      !attempt.questionOrder ||
      !attempt.choiceOrder ||
      parseNumberArray(attempt.questionOrder).length > EXAM_QUESTION_LIMIT
    ) {
      await prismadb.attempt.update({
        where: { id: attempt.id },
        data: {
          questionOrder,
          choiceOrder,
        },
      });
    }

    const savedResponses = attempt
      ? await prismadb.response.findMany({
          where: { attemptId: attempt.id },
          select: { questionId: true, content: true },
        })
      : [];
    const savedResponseMap = new Map(
      savedResponses.map((response) => [response.questionId, response.content ?? ""])
    );
    const questionsById = new Map(
      packageWithQuestions.questions.map((question) => [question.id, question])
    );
    const orderedQuestions = questionOrder
      .map((questionId) => questionsById.get(questionId))
      .filter((question): question is NonNullable<typeof question> => Boolean(question));

    // Transformasi data untuk response
    const transformedData = {
      packageId: packageWithQuestions.id,
      attemptId: attempt.id,
      title: packageWithQuestions.title,
      testName: packageWithQuestions.Test.name,
      duration: resolvedDuration,
      createdAt: attempt.createdAt,
      totalPausedMs: attempt.totalPausedMs,
      questions: orderedQuestions.map((question) => {
        const orderedChoiceIds = choiceOrder[question.id.toString()] || [];
        const choicesById = new Map(
          question.Choices.map((choice) => [choice.id, choice])
        );
        const orderedChoices = orderedChoiceIds.length
          ? orderedChoiceIds
              .map((choiceId) => choicesById.get(choiceId))
              .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
          : question.Choices;

        return {
        id: question.id,
        content: question.content,
        type: question.type,
        answerType: question.answerType,
        image: question.image,
        explanationImage: question.explanationImage,
        savedResponse: savedResponseMap.get(question.id) ?? "",
        choices: orderedChoices.map((choice) => ({
          id: choice.id,
          content: choice.content,
        })),
      };
      }),
    };

    return NextResponse.json(transformedData);
  } else {
    return NextResponse.json(
      { message: "Gagal mengambil data" },
      { status: 500 }
    );
  }
};

// export async function POST(req: Request, context: { params: { id: any } }) {
//   const packageId = context.params.id;
//   const { content, type, explanation, Choices } = await req.json();
//   const form = new formidable.IncomingForm();
//   form.uploadDir = "./public/uploads"; // Tempat menyimpan file yang diunggah
//   form.keepExtensions = true; // Menyimpan ekstensi file
//   try {
//     // Create a new question
//     const newQuestion = await prismadb.question.create({
//       data: {
//         content,
//         type,
//         explanation,
//         packageId : parseInt(packageId), // Ensure packageId is provided and valid
//         Choices: {
//           createMany: {
//             data: Choices.map((choice: Option) => ({
//               content: choice.content,
//               isCorrect: choice.isCorrect,
//               scoreValue: choice.scoreValue,
//             })),
//           },
//         },
//       },
//     });

//     return NextResponse.json({ newQuestion }, { status: 201 });
//   } catch (error: any) {
//     // console.error("Error creating package:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: Request, context: { params: { id: any } }) {
  const packageId = context.params.id;
  const { content, type, answerType, correctAnswer, tolerance, explanation, explanationImage, Choices = [], image } = await req.json();
  try {
    // Periksa apakah tipe soal adalah TKP dan sesuaikan nilai isCorrect jika benar
    const resolvedAnswerType = answerType || "MULTIPLE_CHOICE";
    const isInputQuestion =
      resolvedAnswerType === "SHORT_TEXT" || resolvedAnswerType === "NUMERIC";
    const modifiedChoices = Choices.map((choice: Option) => {
      if (type === "TKP" || resolvedAnswerType === "SCORED_CHOICE") {
        // Untuk TPA, semua pilihan dianggap benar dan scoreValue mengikuti yang dikirim dari frontend
        return {
          ...choice,
          isCorrect: true,
          scoreValue: choice.scoreValue, // Gunakan scoreValue dari frontend
        };
      } else {
        // Untuk tipe soal lain, set scoreValue menjadi 5 jika jawaban benar
        return {
          ...choice,
          scoreValue: choice.isCorrect ? 5 : 0,
        };
      }
    });
    // Create a new question
    const questionData: any = {
      content,
      type,
      answerType: resolvedAnswerType,
      correctAnswer: isInputQuestion ? correctAnswer : null,
      tolerance:
        resolvedAnswerType === "NUMERIC" && tolerance !== undefined
          ? Number(tolerance)
          : null,
      explanation,
      explanationImage,
      image,
      packageId: parseInt(packageId), // Pastikan packageId disediakan dan valid
    };

    if (!isInputQuestion && modifiedChoices.length > 0) {
      questionData.Choices = {
        createMany: {
          data: modifiedChoices,
        },
      };
    }

    const newQuestion = await prismadb.question.create({
      data: questionData,
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
