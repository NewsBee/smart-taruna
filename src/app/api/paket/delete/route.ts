import prismadb from "@/app/lib/prismadb";
import { authOptions } from "@/app/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const DELETE = async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID paket tidak valid" }, { status: 400 });
  }

  const existingPackage = await prismadb.package.findUnique({
    where: { id },
  });

  if (!existingPackage) {
    return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
  }

  if (existingPackage.deletedAt) {
    return NextResponse.json(
      { message: "Paket sudah berada di recycle bin" },
      { status: 409 }
    );
  }

  await prismadb.package.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedById: Number(session.user.id),
      isHidden: true,
      isLocked: true,
    },
  });

  return NextResponse.json(
    { message: "Paket dipindahkan ke recycle bin" },
    { status: 200 }
  );
};
