import { authOptions } from "@/app/lib/auth-options";
import { getUploadErrorMessage, uploadImageToGcs } from "@/app/lib/gcs-upload";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const imageFile = data.get("image");

    if (!imageFile || typeof imageFile === "string") {
      return NextResponse.json(
        { message: "File gambar wajib diunggah." },
        { status: 400 }
      );
    }

    const uploaded = await uploadImageToGcs(
      imageFile,
      `profile/${session.user.id}`,
      imageFile.name
    );

    const updatedUser = await prismadb.user.update({
      where: { id: Number(session.user.id) },
      data: { profileImage: uploaded.url },
    });

    return NextResponse.json(
      {
        message: "Foto profil berhasil diunggah",
        path: uploaded.url,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return NextResponse.json(
      { message: getUploadErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prismadb.user.update({
      where: { id: Number(session.user.id) },
      data: { profileImage: null },
    });

    return NextResponse.json(
      {
        message: "Foto profil berhasil dikosongkan",
        path: null,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json(
      { message: "Gagal mengosongkan foto profil." },
      { status: 500 }
    );
  }
}
