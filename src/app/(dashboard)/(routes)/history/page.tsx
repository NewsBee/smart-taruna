"use client";

import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SearchIcon from "@mui/icons-material/Search";
import TimerIcon from "@mui/icons-material/Timer";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface Attempt {
  id: number;
  score: number | null;
  packageId: number;
  createdAt: string;
  completedAt: string;
  status: "Selesai" | "Berjalan";
  answeredCount: number;
  savedAnswers: number;
  securityEventCount: number;
  tryoutLabel: string;
  Package: {
    title: string;
    id: number;
    duration: number | null;
    tryoutOrder: number | null;
  };
  Test: {
    name: string;
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "done" | "active">("all");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/hasil/byuser", { cache: "no-store" });
        if (!response.ok) throw new Error("Gagal mengambil riwayat ujian");
        const data = await response.json();
        setAttempts(data.attempt || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.status === "Selesai"),
    [attempts]
  );
  const activeAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.status === "Berjalan"),
    [attempts]
  );
  const scores = completedAttempts
    .map((attempt) => attempt.score ?? 0)
    .filter((score) => score >= 0);

  const filteredAttempts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return attempts.filter((attempt) => {
      const matchesKeyword = keyword
        ? `${attempt.Package.title} ${attempt.Test.name} ${attempt.tryoutLabel}`
            .toLowerCase()
            .includes(keyword)
        : true;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "done"
          ? attempt.status === "Selesai"
          : attempt.status === "Berjalan";

      return matchesKeyword && matchesStatus;
    });
  }, [attempts, query, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <CircularProgress size={28} />
          <p className="mt-4 text-sm text-slate-500">Memuat riwayat ujian...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/ujian")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali ke ujian
            </button>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Riwayat CBT
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Riwayat Try Out Saya
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Pantau nilai, paket yang pernah dikerjakan, sesi yang masih berjalan,
              dan catatan aktivitas selama ujian.
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={() => router.push("/ujian")}
          >
            Masuk Ujian
          </Button>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <HistoryIcon className="text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">Total sesi</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{attempts.length}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <AssessmentIcon className="text-emerald-700" />
            <p className="mt-3 text-sm text-emerald-700">Selesai</p>
            <p className="mt-1 text-2xl font-bold text-emerald-950">
              {completedAttempts.length}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <TimerIcon className="text-amber-700" />
            <p className="mt-3 text-sm text-amber-700">Masih berjalan</p>
            <p className="mt-1 text-2xl font-bold text-amber-950">
              {activeAttempts.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <AssessmentIcon className="text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">Rata-rata nilai</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {average(scores)}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                fontSize="small"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50 lg:w-96"
                placeholder="Cari paket, test, atau TO"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "Semua"],
                ["done", "Selesai"],
                ["active", "Berjalan"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value as "all" | "done" | "active")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                    statusFilter === value
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {filteredAttempts.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredAttempts.map((attempt) => {
                const isDone = attempt.status === "Selesai";
                return (
                  <article
                    key={attempt.id}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {attempt.tryoutLabel}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isDone
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {attempt.status}
                          </span>
                        </div>
                        <h2 className="mt-3 text-lg font-bold text-slate-950">
                          {attempt.Package.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {attempt.Test.name} | Mulai {attempt.createdAt}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 px-4 py-3 text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                          Skor
                        </p>
                        <p className="mt-1 text-3xl font-bold text-slate-950">
                          {attempt.score ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Durasi paket</p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {attempt.Package.duration || 0} menit
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Jawaban tersimpan</p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {attempt.savedAnswers}
                        </p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Aktivitas</p>
                        <p className="mt-1 font-semibold text-slate-950">
                          {attempt.securityEventCount}
                        </p>
                      </div>
                    </div>

                    {attempt.securityEventCount > 0 && (
                      <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <WarningAmberIcon fontSize="small" />
                        Ada catatan aktivitas selama sesi ini.
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      {isDone ? (
                        <Button
                          variant="contained"
                          endIcon={<OpenInNewIcon />}
                          onClick={() => router.push(`/hasil/${attempt.id}`)}
                        >
                          Lihat Hasil
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() =>
                            router.push(`/ujian/${attempt.Test.name}/${attempt.Package.id}`)
                          }
                        >
                          Lanjutkan
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <HistoryIcon className="text-slate-400" fontSize="large" />
              <h2 className="mt-3 text-lg font-bold text-slate-950">
                Belum ada riwayat yang cocok
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Riwayat akan muncul setelah Anda mulai atau menyelesaikan try out.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
