import prismadb from "@/app/lib/prismadb";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, context: { params: { id: any } }) => {
    const packageId = context.params.id;
    // const testWithQuestions = await prismadb.test.findUnique({
    //   where: {
    //     id: parseInt(testId),
    //   },
    //   include: {
    //     questions: {
    //       include: {
    //         choices: true, // Mengikutsertakan choices
    //       },
    //     },
    //   },
    // });

    const packageWithQuestions = await prismadb.package.findUnique({
      where: {
        id: parseInt(packageId),
      },
      include: {
        questions: {
          include: {
            Choices: true, // Mengikutsertakan pilihan jawaban
          },
        },
        Test: true, // Mengikutsertakan data Test
      },
    });
  
    if (packageWithQuestions) {
      // Transformasi data untuk response
      const transformedData = {
        packageId: packageWithQuestions.id,
        title: packageWithQuestions.title,
        testName: packageWithQuestions.Test.name,
        questions: packageWithQuestions.questions.map(question => ({
          id: question.id,
          content: question.content,
          type: question.type,
          image: question.image,
          explanation: question.explanation,
          choices: question.Choices.map(choice => ({
            id: choice.id,
            content: choice.content,
            isCorrect: choice.isCorrect,
          })),
        })),
      };

      return NextResponse.json(transformedData);
    } else {
      return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
    }
  };
  
    // const { accessToken } = await getAccessToken();
    // if(testWithQuestions){
    //     // return NextResponse.json({ data: testWithQuestions.questions, "options": ["A", "B", "C"] }, {status:200})
    //     return NextResponse.json({  _id: testWithQuestions?.id, title: "SKD", quiz: testWithQuestions?.questions, options: ["A", "B", "C"]}, {status:200})
    // }



// export const GET = async(req: NextRequest, context: {params: {id: any}} ) =>{
//     const testId = context.params.id
    
//     try {
//         const testWithQuestions = await prismadb.test.findUnique({
//             where: {
//                 id: parseInt(testId),
//             },
//             include: {
//                 questions: true, // Assumed you want to include questions related to the test
//             },
//         });

//         if (testWithQuestions) {
//             NextResponse.json({data: testWithQuestions.questions})
//         } else {
//             NextResponse.json({ message: "Test tidak ada" }, {status:404})
//         }
//     } catch (error) {
//         console.error(error);
//         NextResponse.json({message : "Internal Server Error"}, {status:500})
//     }
// }
