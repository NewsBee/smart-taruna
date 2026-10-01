import { getUploadErrorMessage, uploadImageLocally } from "@/app/lib/local-upload";
import { requireAdmin } from "@/app/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";

function resolveFolder(purpose: FormDataEntryValue | null, quizId: string) {
  if (purpose === "explanation") {
    return `questions/${quizId}/explanations`;
  }

  return `questions/${quizId}/prompts`;
}

export async function POST(
  req: NextRequest,
  context: { params: { quizId: string } }
) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const data = await req.formData();
    const imageFile = data.get("image");

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json(
        { message: "File gambar wajib diunggah." },
        { status: 400 }
      );
    }

    const uploaded = await uploadImageLocally(
      imageFile,
      resolveFolder(data.get("purpose"), context.params.quizId),
      imageFile.name
    );

    return NextResponse.json(
      {
        message: "Gambar berhasil diunggah",
        path: uploaded.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading question image:", error);
    return NextResponse.json(
      { message: getUploadErrorMessage(error) },
      { status: 500 }
    );
  }
}
