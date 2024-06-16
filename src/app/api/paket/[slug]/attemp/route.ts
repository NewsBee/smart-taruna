import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  context: { params: { slug: any } }
) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const packageId = url.searchParams.get("packageId");

  if (!packageId || !date) {
    return NextResponse.json(
      { message: "Package ID and date are required" },
      { status: 400 }
    );
  }

  try {
    const results = await prismadb.attempt.findMany({
      where: {
        packageId: parseInt(packageId as string, 10),
        createdAt: {
          gte: new Date(date as string),
          lt: new Date(
            new Date(date as string).getTime() + 24 * 60 * 60 * 1000
          ),
        },
      },
      include: {
        User: true,
        Package: {
          include: {
            questions: true,
          },
        },
        responses: true,
      },
    });
    // Calculate missed questions
    const questionMissCount: Record<number, number> = {};
    results.forEach((result) => {
      result.responses.forEach((response) => {
        if (!response.content) {
          questionMissCount[response.questionId] =
            (questionMissCount[response.questionId] || 0) + 1;
        }
      });
    });

    return NextResponse.json({ results, questionMissCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
};
