import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

async function uploadImageToS3(
  fileStream: Readable,
  fileName: string
): Promise<string> {
  const fileKey = `jawaban/${uuidv4()}-${fileName}`;

  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
    },
  });

  await uploader.done();

  const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  return fileUrl;
}

export async function POST(req: NextRequest) {
  try {

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
    const fileName = `${uuidv4()}.${fileExtension}`;

    const fileStream = Readable.from(buffer);
    const fileUrl = await uploadImageToS3(fileStream, fileName);

    if (fileUrl) {
      return new Response(JSON.stringify({
        message: "Image uploaded successfully",
        path: fileUrl,
      }), { status: 200 });
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ message: "Error uploading image" }, { status: 500 });
  }
}
