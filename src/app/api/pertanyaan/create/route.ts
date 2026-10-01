import prismadb from "@/app/lib/prismadb";
import { requireAdmin } from "@/app/lib/require-admin";
import { questionSchema } from "../_validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await req.json();
  const parsed = questionSchema.safeParse({ ...body, Choices: body.options ?? body.Choices });
  const packageId = Number(body.packageId);
  if (!parsed.success || !Number.isSafeInteger(packageId) || packageId < 1) {
    return NextResponse.json({ message: "Data soal tidak valid." }, { status: 400 });
  }
  const { Choices, ...data } = parsed.data;
  try {
    const question = await prismadb.question.create({
        data: {
          ...data,
          packageId,
          Choices: { create: Choices.map(({ id, ...choice }) => choice) },
        },
      });
  
    return NextResponse.json({ question }, { status: 200 });
  } catch (error:any) {
    console.error("Error creating package:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }

}
