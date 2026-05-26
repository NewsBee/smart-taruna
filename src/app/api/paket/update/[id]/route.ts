import { normalizeExamToken } from "@/app/api/ujian/_security";
import { parsePassingGrades } from "@/app/api/paket/_passing-grade";
import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const parsePositiveInt = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const PUT = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const packageId = Number(context.params.id);
  if (!Number.isInteger(packageId) || packageId <= 0) {
    return NextResponse.json({ message: "ID paket tidak valid" }, { status: 400 });
  }

  const body = await req.json();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const duration = parsePositiveInt(body.duration);
  const maxAttempts = parsePositiveInt(body.maxAttempts);
  const tryoutOrder = parsePositiveInt(body.tryoutOrder);
  const examToken = normalizeExamToken(body.examToken);
  const tagNames = Array.isArray(body.tagNames)
    ? body.tagNames
        .map((tag: unknown) => String(tag || "").trim())
        .filter(Boolean)
    : [];

  if (!title) {
    return NextResponse.json({ message: "Nama paket wajib diisi" }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ message: "Deskripsi paket wajib diisi" }, { status: 400 });
  }

  if (!duration || duration > 600) {
    return NextResponse.json(
      { message: "Durasi ujian harus berupa angka 1 sampai 600 menit" },
      { status: 400 }
    );
  }

  if (!maxAttempts || maxAttempts > 20) {
    return NextResponse.json(
      { message: "Batas percobaan harus berupa angka 1 sampai 20 kali" },
      { status: 400 }
    );
  }

  if (!tryoutOrder) {
    return NextResponse.json(
      { message: "Urutan Try Out wajib berupa angka lebih dari 0" },
      { status: 400 }
    );
  }

  if (!examToken || examToken.length < 6 || examToken.length > 32) {
    return NextResponse.json(
      { message: "Token ujian wajib 6 sampai 32 karakter" },
      { status: 400 }
    );
  }

  if (!tagNames.length) {
    return NextResponse.json({ message: "Minimal satu tag wajib diisi" }, { status: 400 });
  }

  const existingPackage = await prismadb.package.findUnique({
    where: { id: packageId },
    select: { id: true, testName: true, deletedAt: true },
  });

  if (!existingPackage) {
    return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
  }

  if (existingPackage.deletedAt) {
    return NextResponse.json(
      { message: "Paket di recycle bin tidak bisa diedit. Pulihkan dulu paketnya." },
      { status: 409 }
    );
  }

  const passingGrades = parsePassingGrades(
    body.passingGrades,
    existingPackage.testName,
    false
  );

  const duplicateToken = await prismadb.package.findFirst({
    where: {
      examToken,
      deletedAt: null,
      NOT: { id: packageId },
    },
    select: { id: true, title: true },
  });

  if (duplicateToken) {
    return NextResponse.json(
      { message: `Token sudah digunakan paket "${duplicateToken.title}"` },
      { status: 409 }
    );
  }

  const duplicateOrder = await prismadb.package.findFirst({
    where: {
      testName: existingPackage.testName,
      tryoutOrder,
      deletedAt: null,
      NOT: { id: packageId },
    },
    select: { id: true, title: true },
  });

  if (duplicateOrder) {
    return NextResponse.json(
      { message: `Urutan TO ${tryoutOrder} sudah digunakan paket "${duplicateOrder.title}"` },
      { status: 409 }
    );
  }

  const updatedPackage = await prismadb.package.update({
    where: { id: packageId },
    data: {
      title,
      description,
      duration,
      maxAttempts,
      tryoutOrder,
      examToken,
      tags: {
        set: [],
        connectOrCreate: tagNames.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
      passingGrades: {
        deleteMany: {},
        ...(passingGrades.length
          ? {
              createMany: {
                data: passingGrades,
              },
            }
          : {}),
      },
    },
    include: {
      tags: true,
      questions: true,
      passingGrades: true,
    },
  });

  return NextResponse.json({ package: updatedPackage }, { status: 200 });
};
