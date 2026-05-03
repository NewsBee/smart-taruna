"use client";

import HistoryIcon from "@mui/icons-material/History";
import KeyIcon from "@mui/icons-material/Key";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RuleIcon from "@mui/icons-material/Rule";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ShieldIcon from "@mui/icons-material/Shield";
import TimerIcon from "@mui/icons-material/Timer";
import { Button, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExamTokenAccess } from "../../_components/ExamTokenAccess";

const examHighlights = [
  {
    icon: ShuffleIcon,
    title: "110 soal acak",
    description:
      "Sistem mengambil 110 soal dari bank soal paket saat token divalidasi.",
  },
  {
    icon: KeyIcon,
    title: "Token menentukan paket",
    description:
      "Token yang berbeda membuka paket dan komposisi soal yang berbeda.",
  },
  {
    icon: MonitorHeartIcon,
    title: "Aktivitas tercatat",
    description:
      "Perpindahan tab/window dan heartbeat sesi dipantau selama ujian.",
  },
];

type ActiveAttempt = {
  attemptId: number;
  packageId: number;
  packageTitle: string;
  testName: string;
  duration: number | null;
  tryoutLabel: string;
  startedAt: string;
  lastActiveAt: string;
  savedAnswers: number;
  totalQuestions: number;
  continueUrl: string;
};

const examChecklist = [
  "Gunakan token dari pengawas atau admin.",
  "Pastikan koneksi internet stabil sebelum masuk.",
  "Jangan membuka tab atau aplikasi lain selama ujian.",
  "Jawaban tersimpan otomatis saat ujian berjalan.",
];

export default function TestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const username = session?.user?.username || session?.user?.email || "Peserta";
  const [activeAttempt, setActiveAttempt] = useState<ActiveAttempt | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const loadActiveAttempt = async () => {
      try {
        const response = await fetch("/api/ujian/check", { cache: "no-store" });
        if (!response.ok) {
          setActiveAttempt(null);
          return;
        }

        const data = await response.json();
        setActiveAttempt(data);
      } catch (error) {
        setActiveAttempt(null);
      } finally {
        setCheckingSession(false);
      }
    };

    loadActiveAttempt();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">Portal CBT</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Masuk Ujian
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Halo, {username}. Masukkan token ujian untuk membuka sesi CBT yang
              sudah disiapkan admin.
            </p>
          </div>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => router.push("/history")}
          >
            Riwayat Ujian
          </Button>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="order-2 lg:order-1">
            {checkingSession ? (
              <div className="mb-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <CircularProgress size={18} />
                  Mengecek sesi ujian aktif...
                </div>
              </div>
            ) : activeAttempt ? (
              <div className="mb-6 overflow-hidden rounded-md border border-teal-200 bg-white shadow-sm">
                <div className="border-b border-teal-100 bg-teal-50 px-5 py-4">
                  <p className="text-sm font-semibold text-teal-800">
                    Sesi ujian sedang berjalan
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    {activeAttempt.tryoutLabel} - {activeAttempt.packageTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Anda bisa melanjutkan tanpa memasukkan token lagi.
                  </p>
                </div>
                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Test
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {activeAttempt.testName}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Jawaban tersimpan
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {activeAttempt.savedAnswers}/{activeAttempt.totalQuestions}
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Durasi
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {activeAttempt.duration || 0} menit
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Mulai {activeAttempt.startedAt}. Terakhir aktif{" "}
                    {activeAttempt.lastActiveAt}.
                  </p>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => router.push(activeAttempt.continueUrl)}
                  >
                    Lanjutkan Ujian
                  </Button>
                </div>
              </div>
            ) : null}

            <ExamTokenAccess variant="hero" />

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {examHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                      <Icon fontSize="small" />
                    </div>
                    <h2 className="mt-4 text-base font-bold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="order-1 rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <ShieldIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Sesi Aman
                </p>
                <h2 className="text-xl font-bold text-slate-950">
                  Aturan sebelum mulai
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {examChecklist.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
                >
                  <RuleIcon className="mt-0.5 text-teal-700" fontSize="small" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <TimerIcon fontSize="small" />
                <p className="text-sm font-bold">Catatan waktu</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Timer mengikuti durasi paket. Jika koneksi terputus, status
                offline akan dicatat dan jawaban terakhir disinkronkan kembali.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
