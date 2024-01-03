import checkUserQuizStatus from "@/app/lib/checkStatus";
import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";


export const GET = async(req: any) =>{
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({message: "Unauthorized"}, {status:401}) 
  }
  const userId = session.user.id;
  const userIdNumber = parseInt(userId, 10);
  const existingAttempt = await prismadb.attempt.findFirst({
    where: {
      userId: userIdNumber,
      completedAt: null,
    },
  });
  if (!existingAttempt) {
    return NextResponse.json({message: "No active attempt found"}, {status:404})
  }
  return NextResponse.json({attemptId: existingAttempt.id}, {status:200})
}
