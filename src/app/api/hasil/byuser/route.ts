import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

function formatDate(dateString:any) {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session?.user.id, 10);

  const attempt = await prismadb.attempt.findMany({
    where: { userId: userId },
    include: {
      User: {
        select: {
          username: true,
          email: true,
        },
      },
      Package: {
        select: {
          title: true,
          id: true,
          // Menambahkan judul paket
        },
      },
      Test: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { id: "asc" }, // Urutkan berdasarkan ID attempt
  });
  if (attempt) {
    const formattedAttempts = attempt.map(attempt => {
      return {
        ...attempt,
        createdAt: formatDate(attempt.createdAt),
        completedAt: formatDate(attempt.completedAt),
      };
    });

    return NextResponse.json({ attempt: formattedAttempts });
  } else {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
