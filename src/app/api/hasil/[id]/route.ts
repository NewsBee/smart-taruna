import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export const GET = async (req: NextRequest, context: { params: { id: any } }) => {
  // console.log("Halooo")
    const testId = context.params.id;
    const session = await getServerSession(authOptions);
  
    // if (!session) {
    //   return NextResponse.json({message: "Unauthorized"}, {status:401}) 
    // }
    // const attempt = await prismadb.attempt.findUnique({
    //   where: { id: parseInt(testId) },
    //   include: {
    //     Test: true,
    //     Package: true,
    //     responses: {
    //       include: {
    //         Question: true
    //       }
    //     }
    //   }
    // });
    const attempt = await prismadb.attempt.findUnique({
      where: { id: parseInt(testId) },
      include: {
        responses: {
          include: {
            Question: {
              include: {
                Choices: true,
              },
            },
          },
        },
        // Include other related data if needed
      },
    });
    if (attempt) {
      // console.log("Halooo")
      return NextResponse.json({attempt})
    } else {
      return NextResponse.json({message:"Attempt not found"}, {status:404})
    }
  
  };
  