import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/app/lib/prismadb";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

// const getToken = async () => {
//   const session: any = await getServerSession(authOptions)
//   let token
//   if (session && session.jwt) {
//     token = session.jwt
//   }
//   return token
// }

export const POST = async (req: any, context: { params: { id: any } }) => {
  // console.log("API hit: Start Quiz", req.body);
  // const token = await getToken()
  const session: any = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  const packageId = parseInt(context.params.id, 10);
  // console.log(session.user.id);
  const userId = session.user.id;
  let userIdNumber;

  if (userId) {
    userIdNumber = parseInt(userId, 10); // Mengubah string ke number

    const existingAttempt = await prismadb.attempt.findFirst({
      where: {
        userId: userIdNumber,
        completedAt: null,
      },
    });

    if (existingAttempt && existingAttempt.packageId !== packageId) {
      return NextResponse.json(
        {
          error: "Already attempting another package",
          attemptId: existingAttempt.packageId,
          attempt:existingAttempt?.id
        },
        { status: 403 }
      );
    }

    let attempt = existingAttempt;

    // Jika tidak ada existingAttempt atau untuk paket soal yang sama, buat attempt baru
    if (!existingAttempt || existingAttempt.packageId === packageId) {
      const relatedPackage = await prismadb.package.findUnique({
        where: { id: packageId },
        include: { Test: true },
      });

      if (!relatedPackage) {
        return NextResponse.json(
          { error: "Package not found" },
          { status: 404 }
        );
      }

      // Jika existingAttempt sama, gunakan itu, jika tidak, buat yang baru
      if (!existingAttempt) {
        attempt = await prismadb.attempt.create({
          data: {
            userId: userIdNumber,
            packageId: packageId,
            testId: relatedPackage.Test.id,
            createdAt: new Date(),
          },
        });
      } else {
        attempt = existingAttempt;
      }
    }
    return NextResponse.json({ attemptId: packageId, attempt:attempt?.id });
  }
};
