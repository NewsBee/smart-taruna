import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen, hasReachedAttemptLimit } from "@/app/api/ujian/_attempt";
import {
  createChoiceOrder,
  createQuestionOrder,
  EXAM_QUESTION_LIMIT,
  normalizeExamToken,
  parseNumberArray,
} from "@/app/api/ujian/_security";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// const getToken = async () => {
//   const session: any = await getServerSession(authOptions)
//   let token
//   if (session && session.jwt) {
//     token = session.jwt
//   }
//   return token
// }

export const POST = async (req: NextRequest, context: { params: { id: any } }) => {
  // console.log("API hit: Start Quiz", req.body);
  // const token = await getToken()
  const session: any = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const packageId = parseInt(context.params.id, 10);
  const body = await req.json().catch(() => ({}));
  const submittedToken = normalizeExamToken(body.examToken);
  // console.log(session.user.id);
  const userIdNumber = parseInt(session.user.id, 10);

    let existingAttempt = await prismadb.attempt.findFirst({
      where: {
        userId: userIdNumber,
        completedAt: null,
      },
      select: {
        id: true,
        packageId: true,
      },
    });

    if (existingAttempt) {
      const attemptStatus = await ensureAttemptOpen(existingAttempt.id, userIdNumber);
      if (attemptStatus.status === "expired" || attemptStatus.status === "completed") {
        existingAttempt = null;
      }
    }

    if (existingAttempt && existingAttempt.packageId !== packageId) {
      return NextResponse.json(
        {
          error: "Masih ada paket lain yang sedang dikerjakan",
          attemptId: existingAttempt.packageId,
          attempt: existingAttempt.id
        },
        { status: 403 }
      );
    }

    let attempt = existingAttempt;

    // Jika tidak ada existingAttempt atau untuk paket soal yang sama, buat attempt baru
    if (!existingAttempt || existingAttempt.packageId === packageId) {
      const relatedPackage = await prismadb.package.findUnique({
        where: { id: packageId },
        select: {
          id: true,
          deletedAt: true,
          examToken: true,
          maxAttempts: true,
          Test: {
            select: {
              id: true,
            },
          },
          questions: {
            select: {
              id: true,
              Choices: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!relatedPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }

      if (relatedPackage.deletedAt) {
        return NextResponse.json(
          { error: "Paket sudah tidak tersedia" },
          { status: 410 }
        );
      }

      if (
        relatedPackage.examToken &&
        normalizeExamToken(relatedPackage.examToken) !== submittedToken
      ) {
        return NextResponse.json(
          { error: "Invalid exam token" },
          { status: 403 }
        );
      }

      // Jika existingAttempt sama, gunakan itu, jika tidak, buat yang baru
      if (!existingAttempt) {
        const attemptLimit = await hasReachedAttemptLimit(
          userIdNumber,
          packageId,
          relatedPackage.maxAttempts
        );

        if (attemptLimit.reached) {
          return NextResponse.json(
            {
              error: "Batas pengerjaan tercapai",
              message: `Batas percobaan paket ini sudah habis. Maksimal ${attemptLimit.limit} kali pengerjaan.`,
              attemptCount: attemptLimit.attemptCount,
              maxAttempts: attemptLimit.limit,
            },
            { status: 403 }
          );
        }

        const questionOrder = createQuestionOrder(relatedPackage.questions);
        const choiceOrder = createChoiceOrder(relatedPackage.questions, questionOrder);

        attempt = await prismadb.attempt.create({
          data: {
            userId: userIdNumber,
            packageId: packageId,
            testId: relatedPackage.Test.id,
            createdAt: new Date(),
            examTokenVerifiedAt: new Date(),
            questionOrder,
            choiceOrder,
          },
          select: {
            id: true,
            packageId: true,
          },
        });
      } else {
        const updateData: any = {
          examTokenVerifiedAt: new Date(),
        };

        const existingAttemptWithOrder = await prismadb.attempt.findUnique({
          where: { id: existingAttempt.id },
          select: { questionOrder: true, choiceOrder: true },
        });

        const activeQuestionOrder = parseNumberArray(
          existingAttemptWithOrder?.questionOrder
        );

        if (
          !existingAttemptWithOrder?.questionOrder ||
          activeQuestionOrder.length === 0 ||
          activeQuestionOrder.length > EXAM_QUESTION_LIMIT
        ) {
          updateData.questionOrder =
            activeQuestionOrder.length > EXAM_QUESTION_LIMIT
              ? activeQuestionOrder.slice(0, EXAM_QUESTION_LIMIT)
              : createQuestionOrder(relatedPackage.questions);
        }

        if (!existingAttemptWithOrder?.choiceOrder) {
          updateData.choiceOrder = createChoiceOrder(
            relatedPackage.questions,
            updateData.questionOrder || activeQuestionOrder
          );
        }

        attempt = await prismadb.attempt.update({
          where: { id: existingAttempt.id },
          data: updateData,
          select: {
            id: true,
            packageId: true,
          },
        });
      }
    }
    return NextResponse.json({ attemptId: packageId, attempt: attempt?.id });
};
