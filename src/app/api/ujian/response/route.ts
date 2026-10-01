import { authOptions } from "@/app/lib/auth-options";
import { saveAttemptAnswer } from "../_attempt";
import { answerSchema, ExamError } from "../_answers";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ attemptId: z.coerce.number().int().positive(), questionId: z.coerce.number().int().positive(), response: z.string().max(10000) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Data jawaban tidak valid." }, { status: 400 });
  try {
    const { attemptId, questionId, response } = parsed.data;
    const status = await saveAttemptAnswer(attemptId, Number(session.user.id), answerSchema.parse({ _id: questionId, response }));
    if (status !== "saved") return NextResponse.json({
      message: "Sesi ujian sudah selesai.", completed: true, autoSubmitted: status === "expired",
    }, { status: 409 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof ExamError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("Autosave failed:", error);
    return NextResponse.json({ message: "Jawaban belum tersimpan. Silakan coba lagi." }, { status: 500 });
  }
}
