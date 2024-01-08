import prismadb from "@/app/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { testName, title,description,tagNames } = body;
  try {
    const newPackage = await prismadb.package.create({
      data: {
        testName,
        title,
        description,
        tags: {
          connectOrCreate: tagNames.map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  
    return NextResponse.json({ newPackage }, { status: 200 });
  } catch (error:any) {
    console.error("Error creating package:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }

//   const newPackage = await prismadb.package.create({
//     data: {
//       testName,
//       title,
//       description,
//       tags: {
//         connectOrCreate: tagNames.map((name: string) => ({
//           where: { name },
//           create: { name },
//         })),
//       },
//     },
//   });

//   if (newPackage) {
//     return NextResponse.json({ newPackage }, { status: 200 });
//   } else {
//     return NextResponse.json({ message:"Internal server error" }, { status: 500 });
//   }
}
