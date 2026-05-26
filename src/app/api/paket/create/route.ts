import prismadb from "@/app/lib/prismadb";
import { resolveExamDuration } from "@/app/lib/exam-time";
import { generateExamToken, normalizeExamToken } from "@/app/api/ujian/_security";
import { parsePassingGrades } from "@/app/api/paket/_passing-grade";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { testName, title,description,tagNames,duration } = body;
  const resolvedDuration = resolveExamDuration(Number(duration));
  const examToken = normalizeExamToken(body.examToken) || generateExamToken();
  const requestedTryoutOrder = Number(body.tryoutOrder);
  const requestedMaxAttempts = Number(body.maxAttempts);
  const passingGrades = parsePassingGrades(body.passingGrades, testName);
  try {
    const existingToken = await prismadb.package.findFirst({
      where: { examToken },
      select: { id: true },
    });

    if (existingToken) {
      return NextResponse.json(
        { message: "Token ujian sudah digunakan paket lain" },
        { status: 409 }
      );
    }

    const maxOrder = await prismadb.package.aggregate({
      where: { testName, deletedAt: null },
      _max: { tryoutOrder: true },
    });
    const tryoutOrder =
      Number.isInteger(requestedTryoutOrder) && requestedTryoutOrder > 0
        ? requestedTryoutOrder
        : (maxOrder._max.tryoutOrder || 0) + 1;
    const maxAttempts =
      Number.isInteger(requestedMaxAttempts) && requestedMaxAttempts > 0
        ? requestedMaxAttempts
        : 1;

    if (maxAttempts > 20) {
      return NextResponse.json(
        { message: "Batas percobaan maksimal 20 kali per paket" },
        { status: 400 }
      );
    }

    const existingOrder = await prismadb.package.findFirst({
      where: {
        testName,
        tryoutOrder,
        deletedAt: null,
      },
      select: { id: true, title: true },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          message: `Urutan TO ${tryoutOrder} sudah digunakan oleh paket "${existingOrder.title}"`,
        },
        { status: 409 }
      );
    }

    const newPackage = await prismadb.package.create({
      data: {
        testName,
        title,
        description,
        duration: resolvedDuration,
        maxAttempts,
        examToken,
        tryoutOrder,
        passingGrades: passingGrades.length
          ? {
              createMany: {
                data: passingGrades,
              },
            }
          : undefined,
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
