import prismadb from "@/app/lib/prismadb";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { pipeline } from "stream";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const imageFile = data.get("image");
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!imageFile || typeof imageFile === "string") {
    return NextResponse.json(
      { error: "No image file provided." },
      { status: 400 }
    );
  }

  const user = await prismadb.user.findUnique({
    where: { email: session.user.email },
  });

  if (user && user.profileImage) {
    const oldImagePath = path.join('./public', user.profileImage);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath); // Hapus file lama
    }
  }
  
  const uploadDir = "./public/uploads/profile-pictures";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const fileName = `${Date.now()}-${imageFile.name || "upload.jpg"}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    const reader = imageFile.stream().getReader();
    const fileStream = fs.createWriteStream(filePath);

    // Fungsi untuk menulis chunk ke file
    const pump = () =>
      reader.read().then(({ done, value }) => {
        if (done) {
          fileStream.close();
          return;
        }
        fileStream.write(value);
        pump(); // Rekursif memanggil pump sampai done
      });

    await pump();
    const userEmail = session?.user.email;

    if (!userEmail) {
      // Handle kasus ketika userEmail null atau undefined
      return new Response(JSON.stringify({ error: "User email is missing." }), {
        status: 400,
      });
    }

    const updatedUser = await prismadb.user.update({
      where: { email: userEmail }, // Use appropriate unique identifier
      data: { profileImage: `/uploads/profile-pictures/${fileName}` },
    });

    if (updatedUser) {
      return NextResponse.json(
        {
          message: "File uploaded successfully",
          path: `/uploads/profile-pictures/${fileName}`,
          user: updatedUser,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to upload file",
      },
      { status: 500 }
    );
  }
}
