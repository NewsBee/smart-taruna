import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  const packageId = parseInt(params.id, 10);

  if (isNaN(packageId)) {
    return NextResponse.json({ message: "Invalid package ID" }, { status: 400 });
  }

  try {
    const responses = await prismadb.response.findMany({
      where: {
        Attempt: {
          packageId: packageId,
        },
      },
      include: {
        Question: true,
        Attempt: true,
      },
    });

    const choices = await prismadb.choice.findMany({
      where: {
        questionId: {
          in: responses.map((response) => response.questionId),
        },
      },
    });

    return NextResponse.json({ responses, choices }, { status: 200 });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
};
