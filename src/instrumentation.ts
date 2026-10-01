export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startExamSweeper } = await import("./app/lib/exam-sweeper");
    startExamSweeper();
  }
}
