import { IOption } from "../shared/interfaces";
import { EmptyResponse } from "./EmptyResponse";
import { OptionHasil } from "./OptionHasil";

interface Props {
  responses: any[];
  score: number;
  as: "AFTER_QUIZ_RESPONSE" | "AUTHOR_CHECK_RESPONSE" | "USER_CHECK_RESPONSE";
  quizDeleted?: boolean;
  ref?: string;
  tipe?: string;
  passingGrades?: {
    type: string;
    minScore: number;
  }[];
}

function getQuestionStatus(response: any) {
  if (!response.response) return "Kosong";
  if (response.quiz === "TKP") return response.score > 0 ? "Dinilai" : "Kosong";
  return response.score > 0 ? "Benar" : "Salah";
}

function getStatusClasses(status: string) {
  if (status === "Benar" || status === "Dinilai") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Salah") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-600";
}

export const ShowResponses: React.FC<Props> = ({
  responses,
  score,
  as,
  quizDeleted,
  tipe,
  passingGrades = [],
}) => {
  const maxScore = Math.max(responses.length * 5, 1);
  const percentage = Math.round((score / maxScore) * 100);
  const answered = responses.filter((response) => response.response).length;
  const correct = responses.filter(
    (response) => response.quiz !== "TKP" && response.score > 0
  ).length;
  const wrong = responses.filter(
    (response) => response.quiz !== "TKP" && response.response && response.score === 0
  ).length;

  const scoreByType = responses.reduce((acc: Record<string, { score: number; total: number }>, response) => {
    const key = response.quiz || tipe || "Lainnya";
    if (!acc[key]) acc[key] = { score: 0, total: 0 };
    acc[key].score += response.score || 0;
    acc[key].total += 5;
    return acc;
  }, {});
  const activePassingGrades = passingGrades.filter(
    (grade) => Number(grade.minScore) > 0
  );
  const passingResults = activePassingGrades.map((grade) => {
    const scoreItem = scoreByType[grade.type] || { score: 0, total: 0 };
    return {
      ...grade,
      score: scoreItem.score,
      total: scoreItem.total,
      passed: scoreItem.score >= grade.minScore,
    };
  });
  const hasPassingRule = passingResults.length > 0;
  const passedAll = hasPassingRule && passingResults.every((grade) => grade.passed);

  if (!responses.length) {
    return <EmptyResponse resource="Responses" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Hasil Tryout {tipe || ""}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-950 md:text-3xl">
              Ringkasan Performa Ujian
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Evaluasi jawaban, skor per kategori, dan pembahasan tiap soal.
            </p>
          </div>
          <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            Total soal: <span className="font-semibold text-gray-950">{responses.length}</span>
          </div>
        </div>

        {quizDeleted && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Quiz ini sudah dihapus.
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Skor Akhir</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold text-gray-950">{score}</span>
                  <span className="pb-2 text-lg font-semibold text-gray-400">/ {maxScore}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Persentase capaian: <span className="font-semibold text-gray-950">{percentage}%</span>
                </p>
                {hasPassingRule && (
                  <div
                    className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      passedAll
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {passedAll ? "Memenuhi Nilai Batas" : "Belum Memenuhi Nilai Batas"}
                  </div>
                )}
              </div>
              <div className="h-32 w-32 rounded-full border-[12px] border-indigo-100 p-3">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                  {percentage}%
                </div>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-indigo-600"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Terjawab</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{answered}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Kosong</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{responses.length - answered}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Benar</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">{correct}</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-700">Salah</p>
              <p className="mt-2 text-2xl font-bold text-rose-900">{wrong}</p>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-950">Skor per Kategori</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(scoreByType).map(([type, value]) => {
              const itemPercentage = Math.round((value.score / Math.max(value.total, 1)) * 100);
              return (
                <div key={type} className="rounded-md border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{type}</p>
                    <p className="text-sm text-gray-500">{itemPercentage}%</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {value.score} / {value.total}
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-indigo-600"
                      style={{ width: `${Math.min(itemPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Nilai Batas Kelulusan</h2>
              <p className="mt-1 text-sm text-gray-500">
                Status kelulusan dihitung dari skor kategori pada sesi ujian ini.
              </p>
            </div>
            {hasPassingRule && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  passedAll
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {passedAll ? "Lulus" : "Tidak Lulus"}
              </span>
            )}
          </div>

          {hasPassingRule ? (
            <div className="grid gap-3 md:grid-cols-3">
              {passingResults.map((grade) => (
                <div
                  key={grade.type}
                  className={`rounded-md border p-4 ${
                    grade.passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-950">{grade.type}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        grade.passed
                          ? "bg-white text-emerald-700"
                          : "bg-white text-rose-700"
                      }`}
                    >
                      {grade.passed ? "Tercapai" : "Belum"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">
                    Skor: <span className="font-bold">{grade.score}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    Minimal: <span className="font-bold">{grade.minScore}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Nilai batas kelulusan belum diatur untuk paket ini.
            </div>
          )}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-950">Review Jawaban</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <p className="text-sm font-semibold text-gray-950">Navigasi Soal</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Gunakan nomor soal untuk lompat langsung tanpa scroll panjang.
              </p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {responses.map((response, index) => {
                  const status = getQuestionStatus(response);
                  const statusClass =
                    status === "Benar" || status === "Dinilai"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : status === "Salah"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-gray-50 text-gray-600";

                  return (
                    <a
                      key={response._id || index}
                      href={`#soal-${index + 1}`}
                      className={`flex h-9 items-center justify-center rounded-md border text-sm font-semibold transition hover:-translate-y-0.5 ${statusClass}`}
                      title={`Soal ${index + 1}: ${status}`}
                    >
                      {index + 1}
                    </a>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-emerald-200 bg-emerald-50" />
                  Benar atau dinilai
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-rose-200 bg-rose-50" />
                  Salah
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-gray-200 bg-gray-50" />
                  Kosong
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              {responses.map((response, index) => {
                const status = getQuestionStatus(response);
                return (
                  <article
                    id={`soal-${index + 1}`}
                    className="scroll-mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                    key={response._id || index}
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            Soal {index + 1}
                          </span>
                          <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                            {response.quiz}
                          </span>
                          <span
                            className={`rounded border px-2 py-1 text-xs font-semibold ${getStatusClasses(status)}`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="mt-4 leading-7 text-gray-950">{response.title}</p>
                      </div>
                      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                        Skor {response.score || 0}
                      </div>
                    </div>

                    {response.image && (
                      <div className="mt-4 max-h-80 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                        <img
                          src={response.image}
                          alt="Gambar Soal"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      {response.answerType === "SHORT_TEXT" ||
                      response.answerType === "NUMERIC" ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-gray-200 p-4">
                            <p className="text-xs font-semibold uppercase text-gray-500">Jawaban Anda</p>
                            <p className="mt-2 font-medium text-gray-950">{response.response || "-"}</p>
                          </div>
                          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase text-emerald-700">Kunci Jawaban</p>
                            <p className="mt-2 font-medium text-emerald-950">{response.correct || "-"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {response.options.map((option: IOption, optionIndex: number) => (
                            <OptionHasil
                              key={optionIndex}
                              selectedOption={response.response}
                              correctAns={response.correct}
                              option={option}
                              disabled
                              tipeSoal={response.quiz}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {response.explanation && (
                      <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-900">Pembahasan</p>
                        <p className="mt-2 text-sm leading-6 text-blue-900">{response.explanation}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
