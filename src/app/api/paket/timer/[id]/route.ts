import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
  const duration = Number(body.duration);

  if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
    return NextResponse.json(
      { message: "Durasi ujian harus berupa angka 1 sampai 600 menit" },
      { status: 400 }
    );
  }

  const updatedPackage = await prismadb.package.update({
    where: { id: packageId },
    data: { duration },
    select: {
      id: true,
      duration: true,
    },
  });

  return NextResponse.json(updatedPackage, { status: 200 });
};
