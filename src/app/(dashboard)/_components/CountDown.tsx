import React, { useCallback, useEffect, useMemo, useState } from "react";
import { resolveExamDuration } from "@/app/lib/exam-time";

const CountDown: React.FC<{
  startAt: Date;
  duration: number;
  totalPausedMs?: number;
  isPaused?: boolean;
  onTimeUp: () => void;
}> = ({ startAt, duration, totalPausedMs = 0, isPaused = false, onTimeUp }) => {
  const safeDuration = resolveExamDuration(duration);
  const calculateTimeLeft = useCallback(() => {
    const startTime = new Date(startAt).getTime();
    const endTime = startTime + safeDuration * 60000 + totalPausedMs; // Convert duration from minutes to milliseconds
    const difference = endTime - new Date().getTime();

    let timeLeft: { [key: string]: number } = {
      jam: 0,
      menit: 0,
      detik: 0,
    };

    if (difference > 0) {
      timeLeft = {
        jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
        menit: Math.floor((difference / (1000 * 60)) % 60),
        detik: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }, [safeDuration, startAt, totalPausedMs]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isTimeUp, setIsTimeUp] = useState(false);
  const totalSeconds = timeLeft.jam * 3600 + timeLeft.menit * 60 + timeLeft.detik;
  const isUrgent = totalSeconds <= 300;
  const timerItems = useMemo(() => Object.entries(timeLeft), [timeLeft]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);

      // Check if time is up
      if (
        updatedTimeLeft.jam === 0 &&
        updatedTimeLeft.menit === 0 &&
        updatedTimeLeft.detik === 0 &&
        !isTimeUp
      ) {
        setIsTimeUp(true);
        onTimeUp(); // Call onTimeUp function when time is up
      }
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer
  }, [calculateTimeLeft, isPaused, isTimeUp, onTimeUp, timeLeft]); // Added dependencies

  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        isPaused
          ? "border-amber-200 bg-amber-50"
          : isUrgent
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`mb-2 text-xs font-bold uppercase tracking-wide ${
          isPaused ? "text-amber-700" : isUrgent ? "text-rose-700" : "text-slate-500"
        }`}
      >
        {isPaused ? "Timer dijeda" : "Sisa waktu"}
      </p>
      <div className="flex items-center gap-2">
        {timerItems.map(([interval, value]) => (
        <div key={interval} className="min-w-[54px] rounded-xl bg-slate-950 px-2 py-2 text-center text-white">
          <span className="block text-xl font-bold leading-none md:text-2xl">
            {value < 10 ? `0${value}` : value}
          </span>
          <span className="mt-1 block text-[10px] font-medium uppercase text-slate-300">
            {interval}
          </span>
        </div>
      ))}
      </div>
    </div>
  );
};

export default CountDown;
