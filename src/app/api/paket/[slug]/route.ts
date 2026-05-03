import prismadb from "@/app/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

const MAIN_TEST_NAMES = ["SKD", "TPA"];

export const GET = async(req: NextRequest, context: { params: { slug: any } } ) =>{
  const slug = String(context.params.slug || "").toUpperCase();

  if (!MAIN_TEST_NAMES.includes(slug)) {
    return NextResponse.json({ packages: [] });
  }

    const packages = await prismadb.package.findMany({
        where: {
          Test: {
            name: slug,
          },
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
          questions: true, // Opsional, jika Anda ingin memasukkan pertanyaan dari masing-masing paket
          tags: true,
          passingGrades: {
            orderBy: { type: "asc" },
          },
        },
        orderBy: [
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
