"use client";

import {
  ArrowBack,
  EditNote,
  ImageOutlined,
  Quiz,
  Rule,
  Save,
} from "@mui/icons-material";
import { UpdateQuestionForm } from "@/app/(dashboard)/_components/forms/UpdateQuestionForm";
import { useQuiz } from "@/app/(dashboard)/shared/queries";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Update {
  id: string;
  title: string;
  correct: string;
  options: { _id: number; value: string; poin: number }[];
  type: string;
  answerType?: string;
  correctAnswer?: string;
  tolerance?: number | null;
  explanation: string;
  image?: string;
  explanationImage?: string;
}

export default function UpdateQuestion({
  params,
}: {
  params: { quizid: string; id: string; slug: string };
}) {
  const router = useRouter();
  const packageId = Number(params.id);
  const testName = params.slug.toUpperCase();
  const { data, isLoading, isFetching, error } = useQuiz(parseInt(params.quizid, 10));
  const [questionData, setQuestionData] = useState<Update | null>(null);

  useEffect(() => {
    if (data) {
      const formattedData = {
        id: data.id.toString(),
        title: data.content,
        correct:
          data.Choices.find((choice: any) => choice.isCorrect)?.content ||
          data.correctAnswer ||
          "",
        options: data.Choices.map((choice: any) => ({
          _id: choice.id,
          value: choice.content,
          poin: choice.scoreValue,
        })),
        type: data.type,
        answerType: data.answerType,
        correctAnswer: data.correctAnswer,
        tolerance: data.tolerance,
        explanation: data.explanation,
        image: data.image,
        explanationImage: data.explanationImage,
      };
      setQuestionData(formattedData);
    }
  }, [data]);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          Gagal mengambil data soal. Silakan kembali ke paket dan coba lagi.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-950 px-5 py-5 text-white md:px-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/${testName}/${packageId}`)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <ArrowBack fontSize="small" />
                  Kembali ke Daftar Soal
                </button>
                <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-indigo-200">
                  Edit Soal {testName}
                </p>
                <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                  Perbarui Pertanyaan dan Kunci Jawaban
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Sesuaikan materi, bentuk jawaban, opsi, skor, gambar, dan pembahasan.
                  Perubahan akan tersimpan ke bank soal paket ini.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <InfoPill icon={<Quiz fontSize="small" />} label="Tipe" value={questionData?.type || "-"} />
                <InfoPill
                  icon={<Rule fontSize="small" />}
                  label="Jawaban"
                  value={formatAnswerType(questionData?.answerType || "MULTIPLE_CHOICE")}
                />
                <InfoPill
                  icon={<ImageOutlined fontSize="small" />}
                  label="Gambar"
                  value={questionData?.image ? "Ada" : "Tidak"}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[320px_1fr] md:p-6">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <EditNote />
                </div>
                <h2 className="mt-4 font-bold text-slate-950">Panduan Edit</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <p>Pastikan pertanyaan tidak ambigu dan sesuai dengan tipe materi.</p>
                  <p>Untuk pilihan ganda biasa, pilih satu jawaban benar.</p>
                  <p>Untuk TKP atau pilihan berskor, isi nilai tiap opsi sesuai bobot.</p>
                  <p>Pembahasan sebaiknya menjelaskan alasan jawaban secara singkat.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="font-bold text-slate-950">Status Data</h2>
                <div className="mt-4 space-y-3">
                  <StatusRow label="ID Soal" value={`#${params.quizid}`} />
                  <StatusRow label="ID Paket" value={`#${params.id}`} />
                  <StatusRow label="Sinkron" value={isFetching ? "Memuat ulang" : "Siap diedit"} />
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                    Form Edit
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-950">Detail Soal</h2>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Save fontSize="small" />
                </div>
              </div>

              <div className="p-5">
                {isLoading || !questionData ? (
                  <div className="flex min-h-[420px] items-center justify-center">
                    <CircularProgress />
                  </div>
                ) : (
                  <UpdateQuestionForm slug={params.slug} quizId={packageId} {...questionData} />
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[108px] rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <div className="text-indigo-200">{icon}</div>
      <p className="mt-2 text-xs text-slate-300">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
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
