import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: Array<Array<unknown>>) {
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ].join("\n");
}

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") || "attempts";

  if (type === "students") {
    const users = await prismadb.user.findMany({
      where: { role: { not: "admin" } },
      include: {
        attempts: {
          where: { completedAt: { not: null } },
          include: { Package: true, Test: true },
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { username: "asc" },
    });

    const csv = toCsv(
      ["Nama", "Email", "Jumlah Pengerjaan", "Nilai Terakhir", "Nilai Tertinggi", "Rata-rata"],
      users.map((user) => {
        const scores = user.attempts.map((attempt) => attempt.score || 0);
        const average = scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0;
        return [
          user.username,
          user.email,
          user.attempts.length,
          user.attempts[0]?.score ?? "",
          scores.length ? Math.max(...scores) : 0,
          average,
        ];
      })
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rekap-siswa.csv"',
      },
    });
  }

  const attempts = await prismadb.attempt.findMany({
    where: { completedAt: { not: null } },
    include: {
      User: { select: { username: true, email: true } },
      Package: { select: { title: true, testName: true } },
      Test: { select: { name: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  const csv = toCsv(
    ["ID", "Nama", "Email", "Ujian", "Paket", "Skor", "Mulai", "Selesai"],
    attempts.map((attempt) => [
      attempt.id,
      attempt.User.username,
      attempt.User.email,
      attempt.Test.name,
      attempt.Package.title,
      attempt.score ?? 0,
      attempt.createdAt.toISOString(),
      attempt.completedAt?.toISOString() || "",
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rekap-pengerjaan.csv"',
    },
  });
};
