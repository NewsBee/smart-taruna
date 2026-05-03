import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MAIN_TEST_NAMES = ["SKD", "TPA"];

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function tryoutLabel(order?: number | null) {
  return order ? `TO ${order}` : "TO -";
}

function passesConfiguredPassingGrade(attempt: {
  Package: {
    passingGrades?: { type: string; minScore: number }[];
  };
  responses: { score: number; Question: { type: string } }[];
}) {
  const passingGrades = (attempt.Package.passingGrades || []).filter(
    (grade) => grade.minScore > 0
  );

  if (!passingGrades.length) return false;

  const scoreByType = attempt.responses.reduce<Record<string, number>>(
    (acc, response) => {
      acc[response.Question.type] =
        (acc[response.Question.type] || 0) + (response.score || 0);
      return acc;
    },
    {}
  );

  return passingGrades.every(
    (grade) => (scoreByType[grade.type] || 0) >= grade.minScore
  );
}

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [
    users,
    tests,
    packages,
    attempts,
    activeAttempts,
    questions,
    recentSecurityEvents,
  ] = await Promise.all([
    prismadb.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.test.findMany({
      where: {
        name: { in: MAIN_TEST_NAMES },
      },
      select: { id: true, name: true },
      orderBy: { id: "asc" },
    }),
    prismadb.package.findMany({
      where: {
        testName: { in: MAIN_TEST_NAMES },
      },
      select: {
        id: true,
        title: true,
        testName: true,
        duration: true,
        maxAttempts: true,
        tryoutOrder: true,
        isHidden: true,
        isLocked: true,
        questions: {
          select: { id: true },
        },
        passingGrades: {
          select: {
            type: true,
            minScore: true,
          },
        },
      },
      orderBy: [
        { testName: "asc" },
        { tryoutOrder: "asc" },
        { id: "asc" },
      ],
    }),
    prismadb.attempt.findMany({
      where: {
        completedAt: { not: null },
        Package: {
          testName: { in: MAIN_TEST_NAMES },
        },
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
        completedAt: true,
        User: {
          select: { id: true, username: true, email: true },
        },
        Test: {
          select: { name: true },
        },
        Package: {
          select: {
            id: true,
            title: true,
            testName: true,
            tryoutOrder: true,
            passingGrades: {
              select: {
                type: true,
                minScore: true,
              },
            },
          },
        },
        totalPausedMs: true,
        securityEvents: {
          select: { id: true },
        },
        responses: {
          select: {
            score: true,
            content: true,
            Question: {
              select: {
                id: true,
                type: true,
                content: true,
                Choices: {
                  select: {
                    content: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    }),
    prismadb.attempt.findMany({
      where: {
        completedAt: null,
        Package: {
          testName: { in: MAIN_TEST_NAMES },
        },
      },
      select: {
        id: true,
        createdAt: true,
        lastHeartbeatAt: true,
        User: { select: { username: true, email: true } },
        Package: { select: { title: true, testName: true, tryoutOrder: true } },
        responses: { select: { id: true } },
        securityEvents: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            type: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            securityEvents: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prismadb.question.findMany({
      where: {
        Package: {
          testName: { in: MAIN_TEST_NAMES },
        },
      },
      select: {
        id: true,
        content: true,
        type: true,
        Package: { select: { title: true, testName: true } },
      },
      orderBy: { id: "asc" },
    }),
    prismadb.securityEvent.findMany({
      where: {
        Attempt: {
          Package: {
            testName: { in: MAIN_TEST_NAMES },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        type: true,
        createdAt: true,
        User: {
          select: {
            username: true,
            email: true,
          },
        },
        Attempt: {
          select: {
            id: true,
            Package: {
              select: {
                title: true,
                testName: true,
                tryoutOrder: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const students = users.filter((user) => user.role !== "admin");
  const scores = attempts.map((attempt) => attempt.score ?? 0);
  const highestScore = scores.length ? Math.max(...scores) : 0;
  const lowestScore = scores.length ? Math.min(...scores) : 0;
  const avgScore = average(scores);

  const attemptsByStudent = new Map<number, typeof attempts>();
  for (const attempt of attempts) {
    const current = attemptsByStudent.get(attempt.User.id) || [];
    current.push(attempt);
    attemptsByStudent.set(attempt.User.id, current);
  }

  const studentRows = students.map((student) => {
    const studentAttempts = attemptsByStudent.get(student.id) || [];
    const studentScores = studentAttempts.map((attempt) => attempt.score ?? 0);
    const latestAttempt = studentAttempts[0];
    const attemptsByPackage = new Map<
      number,
      {
        packageTitle: string;
        testName: string;
        packageId: number;
        tryoutOrder: number | null;
        tryoutLabel: string;
        scores: number[];
        totalAttempts: number;
      }
    >();

    for (const attempt of studentAttempts) {
      const current = attemptsByPackage.get(attempt.Package.id) || {
        packageTitle: attempt.Package.title,
        testName: attempt.Package.testName,
        packageId: attempt.Package.id,
        tryoutOrder: attempt.Package.tryoutOrder,
        tryoutLabel: tryoutLabel(attempt.Package.tryoutOrder),
        scores: [],
        totalAttempts: 0,
      };
      current.scores.push(attempt.score ?? 0);
      current.totalAttempts += 1;
      attemptsByPackage.set(attempt.Package.id, current);
    }

    return {
      id: student.id,
      username: student.username,
      email: student.email,
      totalAttempts: studentAttempts.length,
      latestScore: latestAttempt?.score ?? null,
      highestScore: studentScores.length ? Math.max(...studentScores) : 0,
      averageScore: average(studentScores),
      lastTest: latestAttempt?.Package.title || "-",
      lastCompletedAt: formatDate(latestAttempt?.completedAt || null),
      totalSecurityEvents: studentAttempts.reduce(
        (sum, attempt) => sum + attempt.securityEvents.length,
        0
      ),
      attempts: studentAttempts.slice(0, 20).map((attempt) => {
        const answered = attempt.responses.filter((response) => response.content).length;
        const correctAnswers = attempt.responses.filter((response) => response.score > 0).length;
        return {
          id: attempt.id,
          packageId: attempt.Package.id,
          packageTitle: attempt.Package.title,
          testName: attempt.Package.testName,
          tryoutOrder: attempt.Package.tryoutOrder,
          tryoutLabel: tryoutLabel(attempt.Package.tryoutOrder),
          score: attempt.score ?? 0,
          startedAt: formatDate(attempt.createdAt),
          completedAt: formatDate(attempt.completedAt),
          answered,
          totalQuestions: attempt.responses.length,
          correctAnswers,
          pausedMinutes: Math.round((attempt.totalPausedMs || 0) / 60000),
          securityEvents: attempt.securityEvents.length,
        };
      }),
      packageBreakdown: Array.from(attemptsByPackage.values()).map((item) => ({
        packageTitle: item.packageTitle,
        testName: item.testName,
        packageId: item.packageId,
        tryoutOrder: item.tryoutOrder,
        tryoutLabel: item.tryoutLabel,
        totalAttempts: item.totalAttempts,
        highestScore: item.scores.length ? Math.max(...item.scores) : 0,
        averageScore: average(item.scores),
      })),
    };
  });

  const packageRows = packages.map((pkg) => {
    const packageAttempts = attempts.filter((attempt) => attempt.Package.id === pkg.id);
    const packageScores = packageAttempts.map((attempt) => attempt.score ?? 0);
    const passed = packageAttempts.filter((attempt) =>
      passesConfiguredPassingGrade(attempt)
    ).length;
    return {
      id: pkg.id,
      title: pkg.title,
      testName: pkg.testName,
      duration: pkg.duration,
      maxAttempts: pkg.maxAttempts,
      tryoutOrder: pkg.tryoutOrder,
      tryoutLabel: tryoutLabel(pkg.tryoutOrder),
      totalQuestions: pkg.questions.length,
      totalAttempts: packageAttempts.length,
      averageScore: average(packageScores),
      highestScore: packageScores.length ? Math.max(...packageScores) : 0,
      passingRate: packageAttempts.length
        ? Math.round((passed / packageAttempts.length) * 100)
        : 0,
      passingGrades: pkg.passingGrades,
      status: pkg.isHidden ? "Hidden" : pkg.isLocked ? "Locked" : "Published",
    };
  });

  const questionStats = new Map<
    number,
    {
      questionId: number;
      content: string;
      type: string;
      packageTitle: string;
      testName: string;
      totalAnswers: number;
      correctAnswers: number;
      blankAnswers: number;
      optionFrequency: Record<string, number>;
    }
  >();

  for (const question of questions) {
    questionStats.set(question.id, {
      questionId: question.id,
      content: question.content,
      type: question.type,
      packageTitle: question.Package.title,
      testName: question.Package.testName,
      totalAnswers: 0,
      correctAnswers: 0,
      blankAnswers: 0,
      optionFrequency: {},
    });
  }

  for (const attempt of attempts) {
    for (const response of attempt.responses) {
      const stat = questionStats.get(response.Question.id);
      if (!stat) continue;

      const answer = response.content || "";
      stat.totalAnswers += 1;
      if (!answer) stat.blankAnswers += 1;
      if (response.Question.type === "TKP" ? response.score > 0 : response.score > 0) {
        stat.correctAnswers += 1;
      }
      stat.optionFrequency[answer || "(kosong)"] =
        (stat.optionFrequency[answer || "(kosong)"] || 0) + 1;
    }
  }

  const questionRows = Array.from(questionStats.values())
    .map((stat) => {
      const difficulty = stat.totalAnswers
        ? Math.round((stat.correctAnswers / stat.totalAnswers) * 100)
        : 0;
      const mostChosen = Object.entries(stat.optionFrequency).sort((a, b) => b[1] - a[1])[0];

      return {
        ...stat,
        difficulty,
        wrongAnswers: Math.max(stat.totalAnswers - stat.correctAnswers - stat.blankAnswers, 0),
        mostChosenAnswer: mostChosen ? mostChosen[0] : "-",
        mostChosenCount: mostChosen ? mostChosen[1] : 0,
      };
    })
    .sort((a, b) => a.difficulty - b.difficulty)
    .slice(0, 12);

  const recentAttempts = attempts.slice(0, 10).map((attempt) => ({
    id: attempt.id,
    studentName: attempt.User.username,
    email: attempt.User.email,
    packageTitle: attempt.Package.title,
    testName: attempt.Test.name,
    packageId: attempt.Package.id,
    tryoutOrder: attempt.Package.tryoutOrder,
    tryoutLabel: tryoutLabel(attempt.Package.tryoutOrder),
    score: attempt.score ?? 0,
    completedAt: formatDate(attempt.completedAt),
  }));

  const activeSessions = activeAttempts.map((attempt) => ({
    id: attempt.id,
    studentName: attempt.User.username,
    email: attempt.User.email,
    packageTitle: attempt.Package.title,
    testName: attempt.Package.testName,
    tryoutOrder: attempt.Package.tryoutOrder,
    tryoutLabel: tryoutLabel(attempt.Package.tryoutOrder),
    startedAt: formatDate(attempt.createdAt),
    lastHeartbeatAt: formatDate(attempt.lastHeartbeatAt),
    savedAnswers: attempt.responses.length,
    securityEventCount: attempt._count.securityEvents,
    recentSecurityEvents: attempt.securityEvents.map((event) => ({
      id: event.id,
      type: event.type,
      createdAt: formatDate(event.createdAt),
    })),
  }));

  const securityEvents = recentSecurityEvents.map((event) => ({
    id: event.id,
    type: event.type,
    createdAt: formatDate(event.createdAt),
    studentName: event.User.username,
    email: event.User.email,
    attemptId: event.Attempt.id,
    packageTitle: event.Attempt.Package.title,
    testName: event.Attempt.Package.testName,
    tryoutOrder: event.Attempt.Package.tryoutOrder,
    tryoutLabel: tryoutLabel(event.Attempt.Package.tryoutOrder),
  }));

  return NextResponse.json({
    summary: {
      totalStudents: students.length,
      totalTests: tests.length,
      totalPackages: packages.length,
      totalQuestions: questions.length,
      totalAttempts: attempts.length,
      activeSessions: activeAttempts.length,
      averageScore: avgScore,
      highestScore,
      lowestScore,
    },
    tests,
    students: studentRows,
    packages: packageRows,
    questions: questionRows,
    recentAttempts,
    activeSessions,
    securityEvents,
  });
};
