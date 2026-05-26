import { generateExamToken } from "@/app/api/ujian/_security";
import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const buildToken = (testName: string) => `${testName.toUpperCase()}-${generateExamToken()}`;

export const PUT = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const packageId = Number(context.params.id);
  if (!packageId) {
    return NextResponse.json({ message: "Invalid package ID" }, { status: 400 });
  }

  const pkg = await prismadb.package.findUnique({
    where: { id: packageId },
    select: { id: true, testName: true, deletedAt: true },
  });

  if (!pkg) {
    return NextResponse.json({ message: "Package not found" }, { status: 404 });
  }

  if (pkg.deletedAt) {
    return NextResponse.json(
      { message: "Paket di recycle bin tidak bisa dibuatkan token" },
      { status: 409 }
    );
  }

  let examToken = buildToken(pkg.testName);
  let existingToken = await prismadb.package.findFirst({
    where: { examToken },
    select: { id: true },
  });

  while (existingToken) {
    examToken = buildToken(pkg.testName);
    existingToken = await prismadb.package.findFirst({
      where: { examToken },
      select: { id: true },
    });
  }

  const updatedPackage = await prismadb.package.update({
    where: { id: packageId },
    data: { examToken },
    select: {
      id: true,
      examToken: true,
    },
  });

  return NextResponse.json(updatedPackage, { status: 200 });
};
