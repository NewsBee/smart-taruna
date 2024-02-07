import prismadb from "@/app/lib/prismadb";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { pipeline } from "stream";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import AWS from "aws-sdk";
import { Readable } from "stream";
import formidable from "formidable";
import { NextApiRequest } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { v4 as uuidv4 } from 'uuid';
import { Upload } from "@aws-sdk/lib-storage";

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
  const fileKey = `profile-pictures/${uuidv4()}-${fileName}`;

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

// const s3 = new AWS.S3();

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    // const file = data.get("image") as Blob | null;
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
      const updatedUser = await prismadb.user.update({
        where: { id: parseInt(session.user.id, 10) }, // Use appropriate unique identifier
        data: { profileImage: fileUrl },
      });
      if (updatedUser) {
        return NextResponse.json(
          {
            message: "File uploaded successfully",
            path: fileUrl,
            user: updatedUser,
          },
          { status: 200 }
        );
      }
    }

    // const fileUrl = await uploadImageToS3(buffer, fileName);

    // return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    NextResponse.json({ message: "Error uploading image" });
  }
}
// export async function POST(req: NextRequest) {
//   const data = await req.formData();
//   const imageFile = data.get("image");
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user?.email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   if (!imageFile || typeof imageFile === "string") {
//     return NextResponse.json(
//       { error: "No image file provided." },
//       { status: 400 }
//     );
//   }

//   const user = await prismadb.user.findUnique({
//     where: { email: session.user.email },
//   });

//   if (user && user.profileImage) {
//     const oldImagePath = path.join('./public', user.profileImage);
//     if (fs.existsSync(oldImagePath)) {
//       fs.unlinkSync(oldImagePath); // Hapus file lama
//     }
//   }

//   const uploadDir = "./public/uploads/profile-pictures";
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }
//   const fileName = `${Date.now()}-${imageFile.name || "upload.jpg"}`;
//   const filePath = path.join(uploadDir, fileName);

//   const bucketName = process.env.AWS_S3_BUCKET_NAME;
//     if (!bucketName) {
//       throw new Error(
//         "AWS S3 bucket name is not defined in environment variables"
//       );
//     }

//     // Mengunggah ke S3
//     const s3Params = {
//       Bucket: bucketName,
//       Key: fileName,
//       Body: buf,
//       ContentType:
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     };

//     await s3.upload(s3Params).promise();

//   try {
//     const reader = imageFile.stream().getReader();
//     const fileStream = fs.createWriteStream(filePath);

//     // Fungsi untuk menulis chunk ke file
//     const pump = () =>
//       reader.read().then(({ done, value }) => {
//         if (done) {
//           fileStream.close();
//           return;
//         }
//         fileStream.write(value);
//         pump(); // Rekursif memanggil pump sampai done
//       });

//     await pump();
//     const userEmail = session?.user.email;

//     if (!userEmail) {
//       // Handle kasus ketika userEmail null atau undefined
//       return new Response(JSON.stringify({ error: "User email is missing." }), {
//         status: 400,
//       });
//     }

//     const updatedUser = await prismadb.user.update({
//       where: { email: userEmail }, // Use appropriate unique identifier
//       data: { profileImage: `/uploads/profile-pictures/${fileName}` },
//     });

//     if (updatedUser) {
//       return NextResponse.json(
//         {
//           message: "File uploaded successfully",
//           path: `/uploads/profile-pictures/${fileName}`,
//           user: updatedUser,
//         },
//         { status: 200 }
//       );
//     }
//   } catch (error) {
//     return NextResponse.json(
//       {
//         message: "Failed to upload file",
//       },
//       { status: 500 }
//     );
//   }
// }
