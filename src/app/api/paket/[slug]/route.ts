import prismadb from "@/app/lib/prismadb";
import { authOptions } from "@/app/lib/auth-options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const MAIN_TEST_NAMES = ["SKD", "TPA"];

export const GET = async(req: NextRequest, context: { params: { slug: any } } ) =>{
  const slug = String(context.params.slug || "").toUpperCase();
  const deletedMode = req.nextUrl.searchParams.get("deleted");

  if (!MAIN_TEST_NAMES.includes(slug)) {
    return NextResponse.json({ packages: [] });
  }

  if (deletedMode === "only") {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

    const packages = await prismadb.package.findMany({
        where: {
          Test: {
            name: slug,
          },
          deletedAt:
            deletedMode === "only"
              ? { not: null }
              : null,
        },
        select: {
          id: true,
          testName: true,
          title: true,
          description: true,
          duration: true,
          maxAttempts: true,
          examToken: true,
          tryoutOrder: true,
          isHidden: true,
          isLocked: true,
          deletedAt: true,
          deletedBy: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          questions: true, // Opsional, jika Anda ingin memasukkan pertanyaan dari masing-masing paket
          tags: true,
          passingGrades: {
            orderBy: { type: "asc" },
          },
          _count: {
            select: {
              attempts: true,
              questions: true,
            },
          },
        },
        orderBy: [
          ...(deletedMode === "only" ? [{ deletedAt: "desc" as const }] : []),
          { tryoutOrder: "asc" },
          { id: "asc" },
        ],
      });
    // const { accessToken } = await getAccessToken();
    if(packages){
        return NextResponse.json({ packages })
    }else{
        return NextResponse.json({ message: "Gagal mengambil data "}, {status:500})
    }
}
