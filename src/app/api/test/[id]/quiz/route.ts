import prismadb from "@/app/lib/prismadb";
import { requireAdmin } from "@/app/lib/require-admin";
import { planChoiceUpdates, questionSchema } from "@/app/api/pertanyaan/_validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = Number(context.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  const quiz = await prismadb.question.findUnique({ where: { id }, include: { Choices: true } });
  return quiz ? NextResponse.json(quiz) : NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 });
}

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = Number(context.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
  const parsed = questionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0].message }, { status: 400 });
  const existing = await prismadb.question.findUnique({ where: { id }, include: { Choices: true } });
  if (!existing) return NextResponse.json({ message: "Soal tidak ditemukan." }, { status: 404 });
  const { Choices, ...data } = parsed.data;
  const ownedIds = new Set(existing.Choices.map((choice) => choice.id));
  if (Choices.some((choice) => choice.id && !ownedIds.has(choice.id))) {
    return NextResponse.json({ message: "Pilihan tidak termasuk soal ini." }, { status: 400 });
  }
  try {
    const updatedQuestion = await prismadb.question.update({
      where: { id }, data: { ...data, Choices: planChoiceUpdates(Choices) }, include: { Choices: true },
    });
    return NextResponse.json({ updatedQuestion });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ message: "Gagal menyimpan soal." }, { status: 500 });
  }
}
