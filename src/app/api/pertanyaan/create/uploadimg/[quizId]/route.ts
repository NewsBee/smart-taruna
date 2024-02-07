import prismadb from "@/app/lib/prismadb";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { pipeline } from "stream";
import { getServerSession } from "next-auth";
import AWS from "aws-sdk";
import { Readable } from "stream";
import formidable from "formidable";
import { NextApiRequest } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { v4 as uuidv4 } from 'uuid';
import { Upload } from "@aws-sdk/lib-storage";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

// Fungsi untuk mengunggah gambar ke S3
async function uploadImageToS3(
  fileStream: Readable,
  fileName: string
): Promise<string> {
  // const fileKey = `profile-pictures/${Date.now()}-${fileName}`;
  const fileKey = `pertanyaan/${uuidv4()}-${fileName}`;

  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
    },
  });

  await uploader.done();
  

  // Return URL lengkap gambar
  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  return fileUrl;
}

export async function POST(req: NextRequest, context: { params: { quizId: number } }) {
  try {
    const quizId = context.params.quizId;
    const data = await req.formData();
    const imageFile = data.get("image") as Blob | null;
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
    const mimeType = imageFile.type;
    const fileExtension = mimeType.split("/")[1];
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const fileName = `${uuid()}.${fileExtension}`;

    const fileStream = Readable.from(buffer);
    const fileUrl = await uploadImageToS3(fileStream, fileName);
    // console.log(fileUrl)
    if (fileUrl) {
      const updatedQuestion = await prismadb.question.update({
        where: { id: quizId }, // Ganti dengan ID pertanyaan yang sebenarnya
        data: { image: fileUrl }, // Update URL gambar
      });
      if (updatedQuestion) {
        return new Response(JSON.stringify({
          message: "Image uploaded successfully",
          path: fileUrl,
          question: updatedQuestion,
        }), { status: 200 });
      }
    }

    // const fileUrl = await uploadImageToS3(buffer, fileName);

    // return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    NextResponse.json({ message: "Error uploading image" });
  }
}
