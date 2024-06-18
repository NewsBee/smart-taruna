import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (req: NextRequest) => {
  const body = await req.json();
  const { id } = body;

  const existingPackage = await prismadb.package.findUnique({
    where: { id },
  });

  if (!existingPackage) {
    return NextResponse.json({ message: "Package not found" }, { status: 404 });
  }

  // Hapus semua Response yang terkait dengan Attempt yang ada di Package
  const attempts = await prismadb.attempt.findMany({
    where: { packageId: id },
  });

  for (const attempt of attempts) {
    await prismadb.response.deleteMany({
      where: { attemptId: attempt.id },
    });
  }

  // Hapus semua Attempt yang terkait dengan Package
  await prismadb.attempt.deleteMany({
    where: { packageId: id },
  });

  // Hapus Package
  await prismadb.package.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Package successfully deleted" }, { status: 200 });
};
