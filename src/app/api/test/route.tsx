import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";


// export async function GET(req: Request) {
//   try {
//     const tests = await prismadb.test.findMany();
//     NextResponse.json({data:tests}, {status:200})
//   } catch (error: any) {
//     console.log(error);
//     NextResponse.json({mesage:"Gagal mengambil data ",error}, {status:500})
//   }
// }

export const GET = async(req: NextRequest ) =>{
    const tests = await prismadb.test.findMany({})
    // const { accessToken } = await getAccessToken();
    if(tests){
        return NextResponse.json({ tests })
    }else{
        return NextResponse.json({ message: "Gagal mengambil data "}, {status:500})
    }
}
