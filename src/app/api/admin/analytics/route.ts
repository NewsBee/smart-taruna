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

function percentage(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function scoreDistribution(scores: number[]) {
  const buckets = [
    { label: "0-99", count: 0 },
    { label: "100-199", count: 0 },
    { label: "200-299", count: 0 },
    { label: "300-399", count: 0 },
    { label: "400+", count: 0 },
  ];

  for (const score of scores) {
    if (score < 100) buckets[0].count += 1;
    else if (score < 200) buckets[1].count += 1;
    else if (score < 300) buckets[2].count += 1;
    else if (score < 400) buckets[3].count += 1;
    else buckets[4].count += 1;
  }

  return buckets.map((bucket) => ({
    ...bucket,
    percentage: percentage(bucket.count, scores.length),
  }));
}

function riskLevel(score: number) {
  if (score >= 70) return "Tinggi";
  if (score >= 35) return "Sedang";
  return "Rendah";
}

function riskScore(securityEvents: number, pausedMinutes: number, unfinishedSessions = 0) {
  return Math.min(100, securityEvents * 12 + pausedMinutes * 2 + unfinishedSessions * 8);
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
        deletedAt: null,
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
          deletedAt: null,
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
          select: { id: true, type: true },
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
          deletedAt: null,
        },
      },
      select: {
        id: true,
        createdAt: true,
        lastHeartbeatAt: true,
        User: { select: { username: true, email: true } },
        Package: { select: { id: true, title: true, testName: true, tryoutOrder: true } },
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
          deletedAt: null,
        },
      },
      select: {
        id: true,
        content: true,
        type: true,
        Package: { select: { id: true, title: true, testName: true, tryoutOrder: true } },
        Choices: {
          select: {
            content: true,
            isCorrect: true,
            scoreValue: true,
          },
        },
      },
      orderBy: { id: "asc" },
    }),
    prismadb.securityEvent.findMany({
      where: {
        Attempt: {
          Package: {
            testName: { in: MAIN_TEST_NAMES },
            deletedAt: null,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
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

    const typeStats = new Map<
      string,
      {
        type: string;
        totalScore: number;
        totalAnswers: number;
        positiveAnswers: number;
        blankAnswers: number;
      }
    >();

    for (const attempt of studentAttempts) {
      for (const response of attempt.responses) {
        const type = response.Question.type;
        const current = typeStats.get(type) || {
          type,
          totalScore: 0,
          totalAnswers: 0,
          positiveAnswers: 0,
          blankAnswers: 0,
        };

        current.totalScore += response.score || 0;
        current.totalAnswers += 1;
        if (response.score > 0) current.positiveAnswers += 1;
        if (!response.content) current.blankAnswers += 1;
        typeStats.set(type, current);
      }
    }

    const typeBreakdown = Array.from(typeStats.values()).map((item) => ({
      ...item,
      accuracy: percentage(item.positiveAnswers, item.totalAnswers),
      blankRate: percentage(item.blankAnswers, item.totalAnswers),
    }));
    const rankedTypes = typeBreakdown
      .filter((item) => item.totalAnswers > 0)
      .sort((a, b) => b.accuracy - a.accuracy);
    const strongestType = rankedTypes[0]?.type || "-";
    const weakestType = rankedTypes[rankedTypes.length - 1]?.type || "-";
    const totalPausedMinutes = Math.round(
      studentAttempts.reduce((sum, attempt) => sum + (attempt.totalPausedMs || 0), 0) / 60000
    );
    const totalSecurityEvents = studentAttempts.reduce(
      (sum, attempt) => sum + attempt.securityEvents.length,
      0
    );
    const studentRiskScore = riskScore(totalSecurityEvents, totalPausedMinutes);
    const latestScore = studentAttempts[0]?.score ?? null;
    const previousScore = studentAttempts[1]?.score ?? null;
    const progressDelta =
      latestScore !== null && previousScore !== null ? latestScore - previousScore : null;
    const progressTrend =
      progressDelta === null
        ? "Belum cukup data"
        : progressDelta > 0
        ? "Naik"
        : progressDelta < 0
        ? "Turun"
        : "Stabil";
    const recommendation = !studentAttempts.length
      ? "Belum ada hasil try out. Arahkan siswa untuk mengerjakan paket pertama."
      : weakestType !== "-"
      ? `Prioritaskan latihan ${weakestType}, karena akurasi bagian ini paling rendah.`
      : "Pertahankan ritme latihan dan evaluasi hasil setiap selesai try out.";

    return {
      id: student.id,
      username: student.username,
      email: student.email,
      totalAttempts: studentAttempts.length,
      latestScore,
      highestScore: studentScores.length ? Math.max(...studentScores) : 0,
      averageScore: average(studentScores),
      lastTest: latestAttempt?.Package.title || "-",
      lastCompletedAt: formatDate(latestAttempt?.completedAt || null),
      totalSecurityEvents,
      riskScore: studentRiskScore,
      riskLevel: riskLevel(studentRiskScore),
      strongestType,
      weakestType,
      progressDelta,
      progressTrend,
      totalPausedMinutes,
      recommendation,
      typeBreakdown,
      attempts: studentAttempts.slice(0, 20).map((attempt) => {
        const answered = attempt.responses.filter((response) => response.content).length;
        const correctAnswers = attempt.responses.filter((response) => response.score > 0).length;
        const durationMinutes =
          attempt.completedAt && attempt.createdAt
            ? Math.max(
                0,
                Math.round(
                  (attempt.completedAt.getTime() - attempt.createdAt.getTime()) / 60000
                )
              )
            : null;

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
          answeredRate: percentage(answered, attempt.responses.length),
          durationMinutes,
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
    const packageQuestions = questions.filter((question) => question.Package.id === pkg.id);
    const packageActiveSessions = activeAttempts.filter((attempt) => attempt.Package.id === pkg.id);
    const participantCount = new Set(packageAttempts.map((attempt) => attempt.User.id)).size;
    const totalAnswered = packageAttempts.reduce(
      (sum, attempt) =>
        sum + attempt.responses.filter((response) => response.content).length,
      0
    );
    const expectedAnswers = packageAttempts.length * pkg.questions.length;
    const typeBreakdown = Array.from(
      packageQuestions.reduce<Map<string, number>>((acc, question) => {
        acc.set(question.type, (acc.get(question.type) || 0) + 1);
        return acc;
      }, new Map())
    ).map(([type, totalQuestions]) => ({ type, totalQuestions }));
    const packageRiskScore = riskScore(
      packageAttempts.reduce((sum, attempt) => sum + attempt.securityEvents.length, 0),
      Math.round(
        packageAttempts.reduce((sum, attempt) => sum + (attempt.totalPausedMs || 0), 0) /
          60000
      ),
      packageActiveSessions.length
    );
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
      participantCount,
      activeSessionCount: packageActiveSessions.length,
      completionRate: percentage(totalAnswered, expectedAnswers),
      averageScore: average(packageScores),
      highestScore: packageScores.length ? Math.max(...packageScores) : 0,
      passingRate: packageAttempts.length
        ? Math.round((passed / packageAttempts.length) * 100)
        : 0,
      scoreDistribution: scoreDistribution(packageScores),
      typeBreakdown,
      riskScore: packageRiskScore,
      riskLevel: riskLevel(packageRiskScore),
      passingGrades: pkg.passingGrades,
      status: pkg.isHidden ? "Disembunyikan" : pkg.isLocked ? "Dikunci" : "Terbit",
    };
  });

  const questionStats = new Map<
    number,
    {
      questionId: number;
      content: string;
      type: string;
      packageId: number;
      packageTitle: string;
      testName: string;
      tryoutOrder: number | null;
      totalAnswers: number;
      correctAnswers: number;
      blankAnswers: number;
      totalScore: number;
      optionFrequency: Record<string, number>;
      choices: { content: string; isCorrect: boolean; scoreValue: number }[];
    }
  >();

  for (const question of questions) {
    questionStats.set(question.id, {
      questionId: question.id,
      content: question.content,
      type: question.type,
      packageId: question.Package.id,
      packageTitle: question.Package.title,
      testName: question.Package.testName,
      tryoutOrder: question.Package.tryoutOrder,
      totalAnswers: 0,
      correctAnswers: 0,
      blankAnswers: 0,
      totalScore: 0,
      optionFrequency: {},
      choices: question.Choices,
    });
  }

  for (const attempt of attempts) {
    for (const response of attempt.responses) {
      const stat = questionStats.get(response.Question.id);
      if (!stat) continue;

      const answer = response.content || "";
      stat.totalAnswers += 1;
      stat.totalScore += response.score || 0;
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
      const difficulty = percentage(stat.correctAnswers, stat.totalAnswers);
      const blankRate = percentage(stat.blankAnswers, stat.totalAnswers);
      const averageScore = stat.totalAnswers
        ? Math.round(stat.totalScore / stat.totalAnswers)
        : 0;
      const mostChosen = Object.entries(stat.optionFrequency).sort((a, b) => b[1] - a[1])[0];
      const correctChoiceContents = new Set(
        stat.choices
          .filter((choice) => choice.isCorrect || choice.scoreValue > 0)
          .map((choice) => choice.content)
      );
      const optionBreakdown = stat.choices.map((choice) => ({
        content: choice.content,
        isCorrect: choice.isCorrect || choice.scoreValue > 0,
        scoreValue: choice.scoreValue,
        selectedCount: stat.optionFrequency[choice.content] || 0,
        selectedRate: percentage(stat.optionFrequency[choice.content] || 0, stat.totalAnswers),
      }));
      const unusedDistractors = optionBreakdown.filter(
        (choice) => !choice.isCorrect && choice.selectedCount === 0
      ).length;
      const mostChosenIsCorrect = mostChosen ? correctChoiceContents.has(mostChosen[0]) : false;
      const issueFlags: string[] = [];

      if (!stat.totalAnswers) issueFlags.push("Belum ada data jawaban");
      if (stat.totalAnswers >= 5 && difficulty <= 30) issueFlags.push("Terlalu sulit");
      if (stat.totalAnswers >= 5 && difficulty >= 90) issueFlags.push("Terlalu mudah");
      if (stat.totalAnswers >= 5 && blankRate >= 25) issueFlags.push("Banyak dikosongkan");
      if (stat.totalAnswers >= 10 && unusedDistractors > 0) {
        issueFlags.push(`${unusedDistractors} pengecoh tidak dipilih`);
      }
      if (stat.totalAnswers >= 5 && mostChosen && !mostChosenIsCorrect) {
        issueFlags.push("Jawaban salah paling dominan");
      }

      const qualityStatus = !stat.totalAnswers
        ? "Belum ada data"
        : issueFlags.length
        ? "Perlu ditinjau"
        : "Sehat";

      return {
        questionId: stat.questionId,
        content: stat.content,
        type: stat.type,
        packageId: stat.packageId,
        packageTitle: stat.packageTitle,
        testName: stat.testName,
        tryoutOrder: stat.tryoutOrder,
        difficulty,
        blankRate,
        averageScore,
        wrongAnswers: Math.max(stat.totalAnswers - stat.correctAnswers - stat.blankAnswers, 0),
        mostChosenAnswer: mostChosen ? mostChosen[0] : "-",
        mostChosenCount: mostChosen ? mostChosen[1] : 0,
        mostChosenIsCorrect,
        totalAnswers: stat.totalAnswers,
        correctAnswers: stat.correctAnswers,
        blankAnswers: stat.blankAnswers,
        issueFlags,
        qualityStatus,
        optionBreakdown,
      };
    })
    .sort((a, b) => {
      const statusWeight = (value: string) =>
        value === "Perlu ditinjau" ? 0 : value === "Belum ada data" ? 1 : 2;
      return statusWeight(a.qualityStatus) - statusWeight(b.qualityStatus) || a.difficulty - b.difficulty;
    });

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

  const activeSessions = activeAttempts.map((attempt) => {
    const sessionRiskScore = riskScore(attempt._count.securityEvents, 0, 1);

    return {
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
      riskScore: sessionRiskScore,
      riskLevel: riskLevel(sessionRiskScore),
      recentSecurityEvents: attempt.securityEvents.map((event) => ({
        id: event.id,
        type: event.type,
        createdAt: formatDate(event.createdAt),
      })),
    };
  });

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

  const eventBreakdown = Object.entries(
    recentSecurityEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const riskSummary = studentRows.reduce(
    (acc, student) => {
      if (student.riskLevel === "Tinggi") acc.high += 1;
      else if (student.riskLevel === "Sedang") acc.medium += 1;
      else acc.low += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 }
  );

  const topRiskStudents = [...studentRows]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 8)
    .map((student) => ({
      id: student.id,
      username: student.username,
      email: student.email,
      riskScore: student.riskScore,
      riskLevel: student.riskLevel,
      totalSecurityEvents: student.totalSecurityEvents,
      totalPausedMinutes: student.totalPausedMinutes,
    }));

  const questionSummary = {
    totalReviewed: questionRows.filter((question) => question.totalAnswers > 0).length,
    needsReview: questionRows.filter((question) => question.qualityStatus === "Perlu ditinjau").length,
    tooHard: questionRows.filter((question) => question.issueFlags.includes("Terlalu sulit")).length,
    tooEasy: questionRows.filter((question) => question.issueFlags.includes("Terlalu mudah")).length,
    highBlank: questionRows.filter((question) => question.issueFlags.includes("Banyak dikosongkan")).length,
  };

  const packageRowsWithQuality = packageRows.map((pkg) => {
    const packageQuestions = questionRows.filter((question) => question.packageId === pkg.id);
    return {
      ...pkg,
      reviewQuestionCount: packageQuestions.filter(
        (question) => question.qualityStatus === "Perlu ditinjau"
      ).length,
      healthyQuestionCount: packageQuestions.filter(
        (question) => question.qualityStatus === "Sehat"
      ).length,
      questionQualityRate: percentage(
        packageQuestions.filter((question) => question.qualityStatus === "Sehat").length,
        packageQuestions.filter((question) => question.totalAnswers > 0).length
      ),
    };
  });

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
      questionsNeedReview: questionSummary.needsReview,
      highRiskStudents: riskSummary.high,
    },
    tests,
    students: studentRows,
    packages: packageRowsWithQuality,
    questions: questionRows,
    questionSummary,
    recentAttempts,
    activeSessions,
    securityEvents,
    securitySummary: {
      riskSummary,
      topRiskStudents,
      eventBreakdown,
      recentEventCount: recentSecurityEvents.length,
    },
  });
};
