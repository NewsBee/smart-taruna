import prismadb from "./prismadb";
import { autoSubmitAttempt, isAttemptExpired } from "../api/ujian/_attempt";

type SweeperState = { timer?: ReturnType<typeof setInterval>; running: boolean };
const globalState = globalThis as typeof globalThis & { examSweeper?: SweeperState };

export async function sweepExpiredAttempts() {
  let cursor = 0;
  for (;;) {
    const attempts = await prismadb.attempt.findMany({
      where: { completedAt: null, id: { gt: cursor } },
      select: { id: true, createdAt: true, lastHeartbeatAt: true, totalPausedMs: true, Package: { select: { duration: true } } },
      orderBy: { id: "asc" }, take: 100,
    });
    for (const attempt of attempts) {
      if (isAttemptExpired(attempt)) await autoSubmitAttempt(attempt.id);
    }
    if (attempts.length < 100) return;
    cursor = attempts[attempts.length - 1].id;
  }
}

export function startExamSweeper() {
  if (process.env.EXAM_SWEEPER_ENABLED === "false") return;
  const state = globalState.examSweeper ??= { running: false };
  if (state.timer) return;
  const tick = async () => {
    if (state.running) return;
    state.running = true;
    try { await sweepExpiredAttempts(); }
    catch (error) { console.error("Exam expiry sweep failed:", error); }
    finally { state.running = false; }
  };
  state.timer = setInterval(tick, 15000);
  state.timer.unref();
  void tick();
}
