import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest, context: { params: { slug: any } } ) =>{
  const slug = context.params.slug;
    const packages = await prismadb.package.findMany({
        where: {
          Test: {
            name: slug,
          },
        },
        include: {
          questions: true, // Opsional, jika Anda ingin memasukkan pertanyaan dari masing-masing paket
          tags: true,
        },
      });
    // const { accessToken } = await getAccessToken();
    if(packages){
        return NextResponse.json({ packages })
    }else{
        return NextResponse.json({ message: "Gagal mengambil data "}, {status:500})
    }
}
