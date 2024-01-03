import prismadb from "./prismadb";

export default async function checkUserQuizStatus(userId:any) {
    const ongoingAttempt = await prismadb.attempt.findFirst({
      where: {
        userId: userId,
        completedAt: null,
      },
      include: {
        Package: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  
    if (ongoingAttempt) {
      return {
        isTakingQuiz: true,
        currentPackageId: ongoingAttempt.packageId,
        currentPackageName: ongoingAttempt.Package.title,
      };
    }
  
    return { isTakingQuiz: false };
  }