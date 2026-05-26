"use client";

import {
  ArrowBack,
  AutoAwesome,
  Checklist,
  EditNote,
  LibraryBooks,
  QueryStats,
} from "@mui/icons-material";
import { ErrorMessage } from "@/app/(dashboard)/_components/ErrorMessage";
import { Loader } from "@/app/(dashboard)/_components/Svgs";
import { AddQuestionForm } from "@/app/(dashboard)/_components/forms/AddQuestionForm";
import { AddQuestionsSidebar } from "@/app/(dashboard)/_components/AddQuestionsSidebar";
import { IQuestion } from "@/app/(dashboard)/shared/interfaces";
import { useQuizQuestions } from "@/app/(dashboard)/shared/queries";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type QuestionApiItem = {
  id: number;
  content: string;
  type?: string;
  answerType?: string;
  correctAnswer?: string | null;
  tolerance?: number | null;
  image?: string | null;
  explanationImage?: string | null;
  choices?: Array<{
    id: number;
    content: string;
    isCorrect: boolean;
    scoreValue: number;
  }>;
};

export default function AddQuestions({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const router = useRouter();
  const packageId = parseInt(params.id, 10);
  const testName = params.slug.toUpperCase();
  const targetQuestions = testName === "SKD" ? 110 : 100;
  const { data, isLoading, isFetching, error } = useQuizQuestions(packageId);
  const [questions, setQuestions] = useState<IQuestion[]>([]);

  useEffect(() => {
    if (data?.questions) {
      const transformedQuestions = data.questions.map((question: QuestionApiItem) => ({
        _id: question.id.toString(),
        title: question.content,
        quiz: data.testName,
        image: question.image || undefined,
        explanationImage: question.explanationImage || undefined,
        answerType: question.answerType,
        correctAnswer: question.correctAnswer || undefined,
        tolerance: question.tolerance || undefined,
        options: (question.choices || []).map((choice) => ({
          _id: choice.id.toString(),
          value: choice.content,
          label: choice.content,
          poin: choice.scoreValue,
        })),
      }));

      setQuestions(transformedQuestions);
    }
  }, [data]);

  const totalQuestions = questions.length;
  const progress = Math.min(Math.round((totalQuestions / targetQuestions) * 100), 100);
  const remainingQuestions = Math.max(targetQuestions - totalQuestions, 0);
  const packageTitle = data?.title || `Paket ${testName}`;

  const questionTypeStats = useMemo(() => {
    const stats = new Map<string, number>();

    for (const question of data?.questions || []) {
      const type = question.type || "LAINNYA";
      stats.set(type, (stats.get(type) || 0) + 1);
    }

    return Array.from(stats.entries()).map(([type, count]) => ({ type, count }));
  }, [data]);

  const answerTypeStats = useMemo(() => {
    const stats = new Map<string, number>();

    for (const question of data?.questions || []) {
      const type = question.answerType || "MULTIPLE_CHOICE";
      stats.set(type, (stats.get(type) || 0) + 1);
    }

    return Array.from(stats.entries()).map(([type, count]) => ({ type, count }));
  }, [data]);

  if (error) {
    return <ErrorMessage statusCode={404} message="Gagal mengambil data soal" />;
  }

  if (isLoading) {
    return <Loader halfScreen />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-950 px-5 py-5 text-white md:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${testName}`)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ArrowBack fontSize="small" />
                  Kembali ke Paket {testName}
                </button>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-indigo-200">
                  Ruang Kelola Soal
                </p>
                <h1 className="mt-2 text-2xl font-bold md:text-3xl">{packageTitle}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Tambahkan soal, cek kelengkapan pilihan jawaban, dan pantau komposisi materi sebelum paket digunakan siswa.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-end justify-between gap-8">
                  <div>
                    <p className="text-sm text-slate-300">Target soal ditampilkan</p>
                    <p className="mt-1 text-3xl font-bold">{targetQuestions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">Tersedia</p>
                    <p className="mt-1 text-3xl font-bold">{totalQuestions}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/15">
                  <div
                    className="h-2 rounded-full bg-indigo-300 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  {progress}% lengkap, {remainingQuestions} soal lagi menuju target.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Soal"
              value={totalQuestions}
              caption="Soal tersimpan pada paket ini"
              icon={<LibraryBooks fontSize="small" />}
              tone="indigo"
            />
            <StatCard
              title="Sisa Target"
              value={remainingQuestions}
              caption="Jumlah soal yang masih perlu ditambahkan"
              icon={<Checklist fontSize="small" />}
              tone="amber"
            />
            <StatCard
              title="Komposisi Materi"
              value={questionTypeStats.length || 0}
              caption="Tipe soal yang sudah tersedia"
              icon={<QueryStats fontSize="small" />}
              tone="emerald"
            />
            <StatCard
              title="Status Sinkron"
              value={isFetching ? "Memuat" : "Siap"}
              caption="Data otomatis diperbarui setelah soal disimpan"
              icon={<AutoAwesome fontSize="small" />}
              tone="slate"
            />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Daftar Soal</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Gunakan daftar ini untuk cek soal yang sudah masuk.
                  </p>
                </div>
                <span className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                  {totalQuestions}
                </span>
              </div>

              <div className="mt-4 h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <AddQuestionsSidebar id={packageId} questions={questions} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Komposisi Paket</h2>
              <div className="mt-4 space-y-4">
                <StatBreakdown title="Materi Soal" items={questionTypeStats} />
                <StatBreakdown title="Bentuk Jawaban" items={answerTypeStats} />
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 md:px-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Form Soal Baru
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Tambah Soal ke Paket</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Isi pertanyaan, tipe materi, bentuk jawaban, opsi, skor, dan pembahasan soal.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <EditNote fontSize="small" />
                </div>
              </div>
            </div>

            <div className="px-5 py-5 md:px-6">
              <AddQuestionForm quizId={packageId} />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  caption,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  caption: string;
  icon: React.ReactNode;
  tone: "indigo" | "amber" | "emerald" | "slate";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{caption}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatBreakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ type: string; count: number }>;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => {
            const width = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.type}>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatAnswerType(item.type)}</span>
                  <span>{item.count} soal</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-indigo-600"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Belum ada data soal.
          </p>
        )}
      </div>
    </div>
  );
}

function formatAnswerType(type: string) {
  const labels: Record<string, string> = {
    MULTIPLE_CHOICE: "Pilihan ganda",
    SCORED_CHOICE: "Pilihan berskor",
    SHORT_TEXT: "Jawaban teks",
    NUMERIC: "Jawaban angka",
  };

  return labels[type] || type;
}
