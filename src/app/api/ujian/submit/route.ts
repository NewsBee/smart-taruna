import { authOptions } from "@/app/lib/auth-options";
import { finishAttempt } from "../_attempt";
import { ExamError, submitSchema } from "../_answers";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Data jawaban tidak valid." }, { status: 400 });
  try {
    const result = await finishAttempt(parsed.data.attemptId, Number(session.user.id), parsed.data.responses);
    if (!result) return NextResponse.json({ message: "Sesi ujian tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ ...result, completed: true });
  } catch (error) {
    if (error instanceof ExamError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("Submit failed:", error);
    return NextResponse.json({ message: "Jawaban gagal dikumpulkan. Silakan coba lagi." }, { status: 500 });
  }
}
