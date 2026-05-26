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

export const POST = async (req: NextRequest) => {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const submittedToken = normalizeExamToken(body.examToken);
  const testName = body.testName ? String(body.testName) : undefined;

  if (!submittedToken) {
    return NextResponse.json({ message: "Token ujian wajib diisi" }, { status: 400 });
  }

  const userId = Number(session.user.id);
  const packageByToken = await prismadb.package.findFirst({
    where: {
      examToken: submittedToken,
      isHidden: false,
      isLocked: false,
      deletedAt: null,
      ...(testName ? { testName } : {}),
    },
    select: {
      id: true,
      testName: true,
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

  if (!packageByToken) {
    return NextResponse.json(
      { message: "Token ujian tidak valid atau paket belum aktif" },
      { status: 404 }
    );
  }

  let activeAttempt = await prismadb.attempt.findFirst({
    where: {
      userId,
      completedAt: null,
    },
    select: {
      id: true,
      packageId: true,
      questionOrder: true,
      choiceOrder: true,
      Package: {
        select: {
          testName: true,
        },
      },
    },
  });

  if (activeAttempt) {
    const attemptStatus = await ensureAttemptOpen(activeAttempt.id, userId);
    if (attemptStatus.status === "expired" || attemptStatus.status === "completed") {
      activeAttempt = null;
    }
  }

  if (activeAttempt && activeAttempt.packageId !== packageByToken.id) {
    return NextResponse.json(
      {
        message: "Masih ada ujian lain yang sedang berjalan",
        testName: activeAttempt.Package.testName,
        packageId: activeAttempt.packageId,
        attemptId: activeAttempt.id,
      },
      { status: 409 }
    );
  }

  if (activeAttempt) {
    const updateData: any = {
      examTokenVerifiedAt: new Date(),
    };

    const activeQuestionOrder = parseNumberArray(activeAttempt.questionOrder);

    if (
      !activeAttempt.questionOrder ||
      activeQuestionOrder.length === 0 ||
      activeQuestionOrder.length > EXAM_QUESTION_LIMIT
    ) {
      updateData.questionOrder =
        activeQuestionOrder.length > EXAM_QUESTION_LIMIT
          ? activeQuestionOrder.slice(0, EXAM_QUESTION_LIMIT)
          : createQuestionOrder(packageByToken.questions);
    }

    if (!activeAttempt.choiceOrder) {
      updateData.choiceOrder = createChoiceOrder(
        packageByToken.questions,
        updateData.questionOrder || activeQuestionOrder
      );
    }

    await prismadb.attempt.update({
      where: { id: activeAttempt.id },
      data: updateData,
    });

    return NextResponse.json({
      testName: packageByToken.testName,
      packageId: packageByToken.id,
      attemptId: activeAttempt.id,
    });
  }

  const attemptLimit = await hasReachedAttemptLimit(
    userId,
    packageByToken.id,
    packageByToken.maxAttempts
  );

  if (attemptLimit.reached) {
    return NextResponse.json(
      {
        message: `Batas percobaan paket ini sudah habis. Maksimal ${attemptLimit.limit} kali pengerjaan.`,
        attemptCount: attemptLimit.attemptCount,
        maxAttempts: attemptLimit.limit,
      },
      { status: 403 }
    );
  }

  const questionOrder = createQuestionOrder(packageByToken.questions);
  const choiceOrder = createChoiceOrder(packageByToken.questions, questionOrder);

  const attempt = await prismadb.attempt.create({
    data: {
      userId,
      packageId: packageByToken.id,
      testId: packageByToken.Test.id,
      createdAt: new Date(),
      examTokenVerifiedAt: new Date(),
      questionOrder,
      choiceOrder,
    },
    select: {
      id: true,
    },
  });

  return NextResponse.json({
    testName: packageByToken.testName,
    packageId: packageByToken.id,
    attemptId: attempt.id,
  });
};
