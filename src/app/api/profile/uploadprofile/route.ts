import { authOptions } from "@/app/lib/auth-options";
import { deleteLocalImage, getUploadErrorMessage, uploadImageLocally } from "@/app/lib/local-upload";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

async function removeOldImage(url: string | null) {
  try { await deleteLocalImage(url); }
  catch (error) { console.error("Cannot remove old local profile image:", error); }
}

export async function POST(req: NextRequest) {
  let uploadedUrl: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const image = (await req.formData()).get("image");
    if (!image || typeof image === "string") return NextResponse.json({ message: "File gambar wajib diunggah." }, { status: 400 });
    const id = Number(session.user.id);
    const previous = await prismadb.user.findUniqueOrThrow({ where: { id }, select: { profileImage: true } });
    const uploaded = await uploadImageLocally(image, `profile/${id}`);
    uploadedUrl = uploaded.url;
    const user = await prismadb.user.update({
      where: { id }, data: { profileImage: uploaded.url },
      select: { id: true, username: true, profileImage: true },
    });
    uploadedUrl = undefined;
    if (previous.profileImage?.startsWith(`/api/uploads/profile/${id}/`)) await removeOldImage(previous.profileImage);
    return NextResponse.json({ message: "Foto profil berhasil diunggah", path: uploaded.url, user });
  } catch (error) {
    if (uploadedUrl) await removeOldImage(uploadedUrl);
    console.error("Error uploading profile image:", error);
    return NextResponse.json({ message: getUploadErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const id = Number(session.user.id);
    const previous = await prismadb.user.findUniqueOrThrow({ where: { id }, select: { profileImage: true } });
    const user = await prismadb.user.update({
      where: { id }, data: { profileImage: null }, select: { id: true, username: true, profileImage: true },
    });
    if (previous.profileImage?.startsWith(`/api/uploads/profile/${id}/`)) await removeOldImage(previous.profileImage);
    return NextResponse.json({ message: "Foto profil berhasil dikosongkan", path: null, user });
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return NextResponse.json({ message: "Gagal mengosongkan foto profil." }, { status: 500 });
  }
}
