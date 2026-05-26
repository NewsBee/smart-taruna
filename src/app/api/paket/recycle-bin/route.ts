import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID paket tidak valid" }, { status: 400 });
  }

  const existingPackage = await prismadb.package.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      testName: true,
      tryoutOrder: true,
      examToken: true,
      deletedAt: true,
    },
  });

  if (!existingPackage) {
    return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
  }

  if (!existingPackage.deletedAt) {
    return NextResponse.json(
      { message: "Paket tidak berada di recycle bin" },
      { status: 409 }
    );
  }

  if (existingPackage.tryoutOrder) {
    const duplicateOrder = await prismadb.package.findFirst({
      where: {
        testName: existingPackage.testName,
        tryoutOrder: existingPackage.tryoutOrder,
        deletedAt: null,
        NOT: { id },
      },
      select: { title: true },
    });

    if (duplicateOrder) {
      return NextResponse.json(
        {
          message: `Paket tidak bisa dipulihkan karena urutan TO ${existingPackage.tryoutOrder} sudah dipakai paket aktif "${duplicateOrder.title}".`,
        },
        { status: 409 }
      );
    }
  }

  if (existingPackage.examToken) {
    const duplicateToken = await prismadb.package.findFirst({
      where: {
        examToken: existingPackage.examToken,
        deletedAt: null,
        NOT: { id },
      },
      select: { title: true },
    });

    if (duplicateToken) {
      return NextResponse.json(
        {
          message: `Paket tidak bisa dipulihkan karena tokennya sudah dipakai paket aktif "${duplicateToken.title}".`,
        },
        { status: 409 }
      );
    }
  }

  const restoredPackage = await prismadb.package.update({
    where: { id },
    data: {
      deletedAt: null,
      deletedById: null,
    },
  });

  return NextResponse.json(
    { message: "Paket berhasil dipulihkan", package: restoredPackage },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID paket tidak valid" }, { status: 400 });
  }

  const existingPackage = await prismadb.package.findUnique({
    where: { id },
    select: {
      id: true,
      deletedAt: true,
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  });

  if (!existingPackage) {
    return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
  }

  if (!existingPackage.deletedAt) {
    return NextResponse.json(
      { message: "Paket harus masuk recycle bin sebelum dihapus permanen" },
      { status: 409 }
    );
  }

  if (existingPackage._count.attempts > 0) {
    return NextResponse.json(
      {
        message:
          "Paket sudah memiliki riwayat pengerjaan siswa, sehingga tidak boleh dihapus permanen. Biarkan di recycle bin agar data hasil tetap aman.",
      },
      { status: 409 }
    );
  }

  await prismadb.$transaction([
    prismadb.question.deleteMany({
      where: { packageId: id },
    }),
    prismadb.package.update({
      where: { id },
      data: {
        tags: {
          set: [],
        },
      },
    }),
    prismadb.package.delete({
      where: { id },
    }),
  ]);

  return NextResponse.json(
    { message: "Paket berhasil dihapus permanen" },
    { status: 200 }
  );
}
