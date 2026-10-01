import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Silakan login terlebih dahulu." }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ message: "Akses khusus admin." }, { status: 403 });
  return null;
}
