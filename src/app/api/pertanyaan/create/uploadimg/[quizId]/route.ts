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
import { authOptions } from "@/app/lib/auth-options";

const getUploadConfig = () => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return { region, accessKeyId, secretAccessKey, bucket };
};

// Fungsi untuk mengunggah gambar ke S3
async function uploadImageToS3(
  fileStream: Readable,
  fileName: string
): Promise<string> {
  const uploadConfig = getUploadConfig();
  if (!uploadConfig) {
    throw new Error("UPLOAD_STORAGE_NOT_CONFIGURED");
  }

  const s3Client = new S3Client({
    region: uploadConfig.region,
    credentials: {
      accessKeyId: uploadConfig.accessKeyId,
      secretAccessKey: uploadConfig.secretAccessKey,
    },
  });

  // const fileKey = `profile-pictures/${Date.now()}-${fileName}`;
  const fileKey = `pertanyaan/${uuidv4()}-${fileName}`;

  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: uploadConfig.bucket,
      Key: fileKey,
      Body: fileStream,
    },
  });

  await uploader.done();
  

  // Return URL lengkap gambar
  const fileUrl = `https://${uploadConfig.bucket}.s3.${uploadConfig.region}.amazonaws.com/${fileKey}`;
  return fileUrl;
}

export async function POST(req: NextRequest, context: { params: { quizId: string } }) {
  try {
    const quizId =  parseInt(context.params.quizId, 10);
    // console.log(quizId)
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
      return new Response(JSON.stringify({
        message: "Image uploaded successfully",
        path: fileUrl,
      }), { status: 200 });
    }

    // const fileUrl = await uploadImageToS3(buffer, fileName);

    // return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    if (error instanceof Error && error.message === "UPLOAD_STORAGE_NOT_CONFIGURED") {
      return NextResponse.json(
        { message: "Upload gambar belum dikonfigurasi untuk environment ini." },
        { status: 503 }
      );
    }

    console.error("Error uploading image:", error);
    return NextResponse.json({ message: "Gagal mengunggah gambar" }, { status: 500 });
  }
}
