import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth-options";

function formatDate(dateValue: Date | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  return date.toLocaleString("id-ID", {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session?.user.id, 10);

  const attempt = await prismadb.attempt.findMany({
    where: { userId: userId },
    include: {
      User: {
        select: {
          username: true,
          email: true,
        },
      },
      Package: {
        select: {
          title: true,
          id: true,
          duration: true,
          tryoutOrder: true,
        },
      },
      Test: {
        select: {
          name: true,
        },
      },
      responses: {
        select: { id: true, content: true },
      },
      securityEvents: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  if (attempt) {
    const formattedAttempts = attempt.map(attempt => {
      return {
        id: attempt.id,
        score: attempt.score,
        testId: attempt.testId,
        packageId: attempt.packageId,
        userId: attempt.userId,
        createdAt: formatDate(attempt.createdAt),
        completedAt: formatDate(attempt.completedAt),
        status: attempt.completedAt ? "Selesai" : "Berjalan",
        answeredCount: attempt.responses.filter((response) => response.content).length,
        savedAnswers: attempt.responses.length,
        securityEventCount: attempt.securityEvents.length,
        tryoutLabel: attempt.Package.tryoutOrder
          ? `TO ${attempt.Package.tryoutOrder}`
          : "TO -",
        User: attempt.User,
        Package: attempt.Package,
        Test: attempt.Test,
      };
    });

    return NextResponse.json({ attempt: formattedAttempts });
  } else {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
