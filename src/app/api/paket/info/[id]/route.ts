import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const GET = async (req: NextRequest, context: { params: { id: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id,10)
    const packageId = parseInt(context.params.id, 10);

    if (isNaN(packageId)) {
        return NextResponse.json({ message: "Invalid package ID" }, { status: 400 });
    }

    try {
        const totalQuestions = await prismadb.question.count({
            where: {
                packageId: packageId,
            },
        });

        const attemptCount = await prismadb.attempt.count({
            where: {
                packageId: packageId,
                userId: userId,
            },
        });

        const highestScore = await prismadb.attempt.aggregate({
            where: {
                packageId: packageId,
                userId: userId,
            },
            _max: {
                score: true,
            },
        });

        const maxScore = highestScore._max.score ?? 0;

        return NextResponse.json({
            packageId: packageId,
            userId: userId,
            totalQuestions: totalQuestions,
            attemptCount: attemptCount,
            highestScore: maxScore,
        }, {status:200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};
