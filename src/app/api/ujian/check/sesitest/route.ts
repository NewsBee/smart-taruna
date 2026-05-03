import { authOptions } from "@/app/lib/auth-options";
import { ensureAttemptOpen } from "@/app/api/ujian/_attempt";
import checkUserQuizStatus from "@/app/lib/checkStatus";
import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";


export const GET = async(req: any) =>{
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({message: "Unauthorized"}, {status:401}) 
  }
  const userId = session.user.id;
  const userIdNumber = parseInt(userId, 10);
  const currentAttempt = await prismadb.attempt.findFirst({
    where: {
      userId: userIdNumber,
      completedAt: null
    }
  });
  const isUserInTestSession = currentAttempt != null;
  if (!isUserInTestSession) {
    return NextResponse.json({message: "Internal server error"}, {status:500})
  }
  const attemptStatus = await ensureAttemptOpen(currentAttempt.id, userIdNumber);

  if (attemptStatus.status === "expired") {
    return NextResponse.json({
      isUserInTestSession: false,
      completed: true,
      autoSubmitted: true,
      attemptId: currentAttempt.id,
      redirectUrl: `/hasil/${currentAttempt.id}`,
    }, {status:410})
  }

  return NextResponse.json({isUserInTestSession }, {status:200})
}
