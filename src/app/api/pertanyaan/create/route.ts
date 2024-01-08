import prismadb from "@/app/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, type, packageId, options, explanation } = body;
  try {
    const question = await prismadb.question.create({
        data: {
          content,
          type,
          packageId,
          explanation,
          Choices: { create: options },
        },
      });
  
    return NextResponse.json({ question }, { status: 200 });
  } catch (error:any) {
    console.error("Error creating package:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }

}
