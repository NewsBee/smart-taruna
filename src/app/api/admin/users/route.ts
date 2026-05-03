import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export const GET = async (req: NextRequest) => {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search") || "";

  const users = await prismadb.user.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
            { phoneNumber: { contains: search } },
          ],
        }
      : undefined,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      phoneNumber: true,
      education: true,
      major: true,
      institution: true,
      createdAt: true,
      attempts: {
        where: { completedAt: { not: null } },
        select: { score: true, completedAt: true },
        orderBy: { completedAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((user) => {
      const scores = user.attempts.map((attempt) => attempt.score || 0);
      const averageScore = scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        education: user.education,
        major: user.major,
        institution: user.institution,
        createdAt: user.createdAt,
        totalAttempts: user.attempts.length,
        latestScore: user.attempts[0]?.score ?? null,
        averageScore,
        highestScore: scores.length ? Math.max(...scores) : 0,
      };
    }),
  });
};
