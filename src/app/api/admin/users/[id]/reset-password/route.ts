import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export const POST = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(context.params.id);
  if (!userId) {
    return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
  }

  const { password } = resetPasswordSchema.parse(await req.json());
  const hashedPassword = await hash(password, 10);

  await prismadb.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password berhasil direset" });
};
