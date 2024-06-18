import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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
        Question: {
          include: {
            Choices: true,
          },
        },
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

    // Define types for questionChoiceMap and responseCountMap
    const questionChoiceMap: { [key: number]: any[] } = {};
    const responseCountMap: { [key: number]: { [key: string]: number } } = {};

    // Calculate the percentage of each choice
    choices.forEach(choice => {
      if (!questionChoiceMap[choice.questionId]) {
        questionChoiceMap[choice.questionId] = [];
      }
      questionChoiceMap[choice.questionId].push(choice);
    });

    responses.forEach(response => {
      const responseContent = response.content ?? "";
      if (!responseCountMap[response.questionId]) {
        responseCountMap[response.questionId] = {};
      }
      if (!responseCountMap[response.questionId][responseContent]) {
        responseCountMap[response.questionId][responseContent] = 0;
      }
      responseCountMap[response.questionId][responseContent]++;
    });

    const choicePercentageMap: { [key: number]: any[] } = {};
    for (const [questionId, choices] of Object.entries(questionChoiceMap)) {
      const totalResponses = Object.values(responseCountMap[parseInt(questionId)] || {}).reduce((acc, count) => acc + count, 0);
      choices.forEach(choice => {
        const matchCount = responseCountMap[parseInt(questionId)]?.[String(choice.id)] || 0;
        choice.percentage = totalResponses ? (matchCount / totalResponses) * 100 : 0;
        if (!choicePercentageMap[parseInt(questionId)]) {
          choicePercentageMap[parseInt(questionId)] = [];
        }
        choicePercentageMap[parseInt(questionId)].push(choice);
      });
    }

    const enrichedResponses = responses.map(response => ({
      ...response,
      choices: choicePercentageMap[response.questionId] || [],
      correct: response.Question.Choices.find(choice => choice.isCorrect)?.id.toString()
    }));

    return NextResponse.json({ responses: enrichedResponses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Failed to fetch responses" },
      { status: 500 }
    );
  }
};
