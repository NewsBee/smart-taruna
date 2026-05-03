import { authOptions } from "@/app/lib/auth-options";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const updateUserSchema = z.object({
  username: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.string().min(1),
  phoneNumber: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  institution: z.string().nullable().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export const PATCH = async (
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

  const body = updateUserSchema.parse(await req.json());

  const existingEmail = await prismadb.user.findUnique({
    where: { email: body.email },
    select: { id: true },
  });

  if (existingEmail && existingEmail.id !== userId) {
    return NextResponse.json(
      { message: "Email sudah digunakan user lain" },
      { status: 409 }
    );
  }

  const existingUsername = await prismadb.user.findUnique({
    where: { username: body.username },
    select: { id: true },
  });

  if (existingUsername && existingUsername.id !== userId) {
    return NextResponse.json(
      { message: "Nama sudah digunakan user lain" },
      { status: 409 }
    );
  }

  const user = await prismadb.user.update({
    where: { id: userId },
    data: {
      username: body.username,
      email: body.email,
      role: body.role,
      phoneNumber: body.phoneNumber || null,
      education: body.education || null,
      major: body.major || null,
      institution: body.institution || null,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      phoneNumber: true,
      education: true,
      major: true,
      institution: true,
    },
  });

  return NextResponse.json({ user });
};
