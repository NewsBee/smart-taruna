import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { Prisma } from "@prisma/client";

const safeAverage = (values: number[]) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const formatDate = (date?: Date | null) =>
  date
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
    : "-";

const getCompletionRate = (completed: number, total: number) =>
  total ? Math.round((completed / total) * 100) : 0;

export const GET = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prismadb.user.findUnique({
      where: { email: session.user.email },
      include: {
        socialLinks: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const attempts = await prismadb.attempt.findMany({
      where: { userId: user.id },
      include: {
        Package: {
          include: {
            Test: true,
            questions: {
              select: { id: true },
            },
          },
        },
        responses: {
          select: {
            id: true,
            score: true,
            questionId: true,
          },
        },
        securityEvents: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const completedAttempts = attempts.filter((attempt) => attempt.completedAt);
    const scores = completedAttempts.map((attempt) => attempt.score ?? 0);
    const bestAttempt = completedAttempts.reduce<(typeof completedAttempts)[number] | null>(
      (best, attempt) => {
        if (!best) return attempt;
        return (attempt.score ?? 0) > (best.score ?? 0) ? attempt : best;
      },
      null
    );
    const latestAttempt = attempts[0] || null;
    const completionRate = getCompletionRate(completedAttempts.length, attempts.length);
    const totalSecurityEvents = attempts.reduce(
      (sum, attempt) => sum + attempt.securityEvents.length,
      0
    );

    const groupedByTest = new Map<
      string,
      {
        testName: string;
        attempts: typeof attempts;
      }
    >();

    for (const attempt of attempts) {
      const testName = attempt.Package.Test.name;
      const current = groupedByTest.get(testName) || { testName, attempts: [] };
      current.attempts.push(attempt);
      groupedByTest.set(testName, current);
    }

    const perTestStats = Array.from(groupedByTest.values()).map((item) => {
      const testCompleted = item.attempts.filter((attempt) => attempt.completedAt);
      const testScores = testCompleted.map((attempt) => attempt.score ?? 0);

      return {
        testName: item.testName,
        totalAttempts: item.attempts.length,
        completedAttempts: testCompleted.length,
        averageScore: safeAverage(testScores),
        highestScore: testScores.length ? Math.max(...testScores) : 0,
        latestScore: testCompleted[0]?.score ?? null,
      };
    });

    const trend = completedAttempts
      .slice()
      .reverse()
      .slice(-10)
      .map((attempt, index) => ({
        name: `TO ${index + 1}`,
        packageTitle: attempt.Package.title,
        testName: attempt.Package.Test.name,
        score: attempt.score ?? 0,
        averageResponseScore: attempt.responses.length
          ? Math.round(
              attempt.responses.reduce((sum, response) => sum + response.score, 0) /
                attempt.responses.length
            )
          : 0,
      }));

    const recentAttempts = attempts.slice(0, 8).map((attempt) => ({
      id: attempt.id,
      packageTitle: attempt.Package.title,
      testName: attempt.Package.Test.name,
      score: attempt.score,
      status: attempt.completedAt ? "Selesai" : "Belum selesai",
      answeredCount: attempt.responses.length,
      questionCount: Array.isArray(attempt.questionOrder)
        ? attempt.questionOrder.length
        : attempt.Package.questions.length,
      securityEventCount: attempt.securityEvents.length,
      createdAt: formatDate(attempt.createdAt),
      completedAt: formatDate(attempt.completedAt),
    }));

    const lowestStat = perTestStats
      .filter((stat) => stat.completedAttempts > 0)
      .sort((a, b) => a.averageScore - b.averageScore)[0];

    const analysis = {
      headline:
        completedAttempts.length > 0
          ? `Rata-rata nilai kamu ${safeAverage(scores)} dari ${completedAttempts.length} try out selesai.`
          : "Belum ada try out yang selesai. Mulai dari paket yang tersedia agar progres bisa dianalisis.",
      focus:
        lowestStat && lowestStat.averageScore < 330
          ? `Prioritaskan latihan ${lowestStat.testName}, karena rata-ratanya masih ${lowestStat.averageScore}.`
          : completedAttempts.length
            ? "Performa umum sudah stabil. Pertahankan ritme latihan dan evaluasi soal yang nilainya belum maksimal."
            : "Kerjakan minimal satu paket sampai selesai agar sistem bisa membaca pola kemampuanmu.",
      discipline:
        totalSecurityEvents > 0
          ? `Ada ${totalSecurityEvents} catatan aktivitas selama ujian. Usahakan tetap berada di halaman ujian sampai selesai.`
          : "Belum ada catatan aktivitas mencurigakan selama ujian.",
      consistency:
        completionRate >= 80
          ? "Konsistensi penyelesaian try out sangat baik."
          : attempts.length
            ? `Tingkat penyelesaian ${completionRate}%. Selesaikan sesi ujian yang sudah dimulai agar analisis makin akurat.`
            : "Konsistensi belum bisa dinilai karena belum ada riwayat pengerjaan.",
    };

    const adminSummary =
      user.role === "admin"
        ? await Promise.all([
            prismadb.user.count({ where: { role: "siswa" } }),
            prismadb.package.count({ where: { deletedAt: null } }),
            prismadb.question.count(),
            prismadb.attempt.count(),
            prismadb.attempt.count({ where: { completedAt: null } }),
          ]).then(
            ([students, packages, questions, totalAttempts, activeAttempts]) => ({
              students,
              packages,
              questions,
              totalAttempts,
              activeAttempts,
            })
          )
        : null;

    const userProfile = {
      role: user.role,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      lastEducation: user.education || "",
      major: user.major || "",
      destinationInstitution: user.institution || "",
      socialLinks: user.socialLinks,
      avatar: user.profileImage,
      summary: {
        totalAttempts: attempts.length,
        completedAttempts: completedAttempts.length,
        averageScore: safeAverage(scores),
        highestScore: bestAttempt?.score ?? 0,
        latestScore: latestAttempt?.score ?? null,
        completionRate,
        totalSecurityEvents,
        bestPackage: bestAttempt?.Package.title || "-",
      },
      perTestStats,
      trend,
      recentAttempts,
      analysis,
      adminSummary,
      tryOutStatsSKD: perTestStats
        .filter((stat) => stat.testName === "SKD")
        .map((stat) => ({
          name: stat.testName,
          highestSKD: stat.highestScore,
          averageSKD: stat.averageScore,
        })),
      tryOutStatsTPA: perTestStats
        .filter((stat) => stat.testName === "TPA")
        .map((stat) => ({
          name: stat.testName,
          highestSKD: stat.highestScore,
          averageSKD: stat.averageScore,
        })),
    };

    return NextResponse.json({ userProfile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const username = String(body.username || "").trim();
  const phoneNumber = String(body.phoneNumber || "").trim();
  const lastEducation = String(body.lastEducation || body.education || "").trim();
  const major = String(body.major || "").trim();
  const destinationInstitution = String(
    body.destinationInstitution || body.institution || ""
  ).trim();

  if (!username) {
    return NextResponse.json(
      { error: "Nama tidak boleh kosong" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prismadb.user.update({
      where: { email: session.user.email },
      data: {
        username,
        phoneNumber,
        education: lastEducation,
        major,
        institution: destinationInstitution,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        userProfile: {
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber || "",
          lastEducation: updatedUser.education || "",
          major: updatedUser.major || "",
          destinationInstitution: updatedUser.institution || "",
          avatar: updatedUser.profileImage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Nama pengguna sudah dipakai akun lain" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
};
