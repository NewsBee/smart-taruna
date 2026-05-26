"use client";

import { Button } from "@material-ui/core";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmSubmitModalContent } from "../../../_components/ConfirmSubmitModal";
import { EmptyResponse } from "../../../_components/EmptyResponse";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { ModalSkeleton } from "../../../_components/Modal";
import { Player } from "../../../_components/Player";
import { Loader } from "../../../_components/Svgs";
import { IResponse } from "../../../shared/interfaces";
import { useQuizQuestions } from "../../../shared/queries";
import axios from "axios";
import CountDown from "@/app/(dashboard)/_components/CountDown";
import { useRouter } from "next/navigation";
import { resolveExamDuration } from "@/app/lib/exam-time";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiShield,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

export default function PlayerScreen({
  params,
}: {
  params: { slug: string[] };
}) {
  const packageId = parseInt(params.slug[1]);

  const { data, isLoading, isFetching, error } = useQuizQuestions(
    parseInt(params.slug[1])
  );
  // console.log(params.slug[0]);
  // console.log(data);
  const [activeIndex, setActiveIndex] = useState(0);
  const [response, setResponse] = useState<IResponse[]>([]);
  const [quizEnd, setQuizEnd] = useState(false);
  const [isSubmitConfirmed, setIsSubmitConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineStartedAt, setOfflineStartedAt] = useState<number | null>(null);
  const [extraPausedMs, setExtraPausedMs] = useState(0);
  const [securityEventCount, setSecurityEventCount] = useState(0);
  const [leaveWarningOpen, setLeaveWarningOpen] = useState(false);
  const [pendingLeaveUrl, setPendingLeaveUrl] = useState<string | null>(null);
  const allowLeaveRef = useRef(false);
  const [confirmSubmitModalActive, setConfirmSubmitModalActive] =
    useState(false);

  const handleConfirmSubmitModalOpen = () => setConfirmSubmitModalActive(true);
  const handleConfirmSubmitModalClose = () =>
    setConfirmSubmitModalActive(false);

  const onSubmit = () => {
    handleConfirmSubmitModalOpen();
  };

  const router = useRouter();

  const onSubmitTimeUp = async () => {
    try {
      // Replace '/api/path-to-submit-quiz' dengan endpoint API Anda yang sebenarnya
      const res = await axios.post("/api/ujian/submit", {
        attemptId,
        responses: response,
      });
      // console.log(res.data);

      // Redirect atau menampilkan pesan sukses
      enqueueSnackbar("Jawaban berhasil dikirim !", {
        variant: "success",
      });
      allowLeaveRef.current = true;
      router.push(`/hasil/${attemptId}`); // Sesuaikan path navigasi sesuai kebutuhan
    } catch (error) {
      console.error("Error submitting quiz:", error);
      enqueueSnackbar("Gagal mengirim jawaban.", { variant: "error" });
    }
  };

  const saveResponse = useCallback(async (questionId: string, answer: string) => {
    if (!attemptId) return;

    try {
      await axios.post("/api/ujian/response", {
        attemptId,
        questionId,
        response: answer,
      });
    } catch (error: any) {
      if (error.response?.data?.autoSubmitted) {
        enqueueSnackbar("Waktu ujian habis. Jawaban otomatis dikumpulkan.", {
          variant: "info",
        });
        allowLeaveRef.current = true;
        router.push(`/hasil/${attemptId}`);
        return;
      }
      console.error("Error autosaving answer:", error);
    }
  }, [attemptId, router]);

  const logSecurityEvent = useCallback(
    async (type: string) => {
      if (!attemptId) return;

      if (type === "TAB_HIDDEN" || type === "WINDOW_BLUR") {
        setSecurityEventCount((current) => current + 1);
      }
      try {
        await axios.post("/api/ujian/security-event", {
          attemptId,
          type,
          visibilityState: document.visibilityState,
          clientTime: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error logging security event:", error);
      }
    },
    [attemptId]
  );

  useEffect(() => {
    const fetchAttemptId = async () => {
      try {
        const response = await axios.get("/api/ujian/check");
        setAttemptId(response.data.attemptId);
      } catch (error) {
        console.error("Error fetching current attempt:", error);
        // Handle error (misalnya menampilkan pesan error)
      }
    };

    fetchAttemptId();
  }, []);

  // console.log(response)

  useEffect(() => {
    if (data && data.questions) {
      // Mengubah data soal menjadi format yang dibutuhkan oleh state response
      const newResponses = data.questions.map((q: any) => ({
        _id: q.id.toString(),
        title: q.content,
        image: q.image,
        answerType: q.answerType,
        correctAnswer: q.correctAnswer,
        tolerance: q.tolerance,
        quiz: data.testName, // Nama tes, misalnya 'SKD'
        response: q.savedResponse || "",
        options: q.choices.map((choice: any) => ({
          value: choice.content,
          label: choice.content,
        })),
      }));
      setResponse(newResponses);
    }
  }, [data, packageId]);

  useEffect(() => {
    if (!attemptId) return;

    const heartbeat = setInterval(() => {
      axios.post("/api/ujian/heartbeat", { attemptId }).then((response) => {
        if (response.data?.autoSubmitted) {
          enqueueSnackbar("Waktu ujian habis. Jawaban otomatis dikumpulkan.", {
            variant: "info",
          });
          allowLeaveRef.current = true;
          router.push(`/hasil/${attemptId}`);
        }
      }).catch((error) => {
        console.error("Error sending heartbeat:", error);
      });
    }, 15000);

    return () => clearInterval(heartbeat);
  }, [attemptId, router]);

  useEffect(() => {
    if (!attemptId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logSecurityEvent("TAB_HIDDEN");
      } else {
        logSecurityEvent("TAB_VISIBLE");
      }
    };

    const handleWindowBlur = () => {
      logSecurityEvent("WINDOW_BLUR");
    };

    const handleWindowFocus = () => {
      logSecurityEvent("WINDOW_FOCUS");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [attemptId, logSecurityEvent]);

  useEffect(() => {
    const updateStatus = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);
      if (offline) {
        setOfflineStartedAt((current) => current ?? Date.now());
      }
    };
    updateStatus();

    const syncSavedResponses = async () => {
      if (!attemptId) return;
      if (offlineStartedAt) {
        const pausedMs = Date.now() - offlineStartedAt;
        try {
          const pauseResponse = await axios.post("/api/ujian/pause", {
            attemptId,
            pausedMs,
          });
          setExtraPausedMs((current) => current + (pauseResponse.data.addedPausedMs || 0));
        } catch (error) {
          console.error("Error saving paused duration:", error);
        } finally {
          setOfflineStartedAt(null);
        }
      }
      response
        .filter((item) => item.response !== "")
        .forEach((item) => {
          saveResponse(item._id, item.response);
        });
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("online", syncSavedResponses);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("online", syncSavedResponses);
      window.removeEventListener("offline", updateStatus);
    };
  }, [attemptId, response, offlineStartedAt, saveResponse]);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      if (allowLeaveRef.current) return;
      const message = "Apakah Anda yakin ingin meninggalkan halaman ini?";
      e.preventDefault();
      e.returnValue = message; // Standar untuk kebanyakan browser
      return message; // Untuk beberapa versi browser yang lebih tua
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    window.history.pushState({ examGuard: true }, "", window.location.href);

    const requestLeave = (url: string | null) => {
      setPendingLeaveUrl(url);
      setLeaveWarningOpen(true);
    };

    const handlePopState = () => {
      if (allowLeaveRef.current) return;
      window.history.pushState({ examGuard: true }, "", window.location.href);
      requestLeave("/ujian");
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (allowLeaveRef.current) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.href === window.location.href) return;

      event.preventDefault();
      requestLeave(nextUrl.pathname + nextUrl.search + nextUrl.hash);
    };

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const confirmLeaveExam = () => {
    allowLeaveRef.current = true;
    setLeaveWarningOpen(false);
    router.push(pendingLeaveUrl || "/ujian");
  };

  // useEffect(() => {
  //   console.log("Responses:", data);
  // }, [data]);

  // console.log(attemptId)

  // Render error jika ada
  if (error) {
    const responseError = error as any;
    const redirectUrl = responseError.response?.data?.redirectUrl;
    if (responseError.response?.status === 410 && redirectUrl) {
      allowLeaveRef.current = true;
      router.push(redirectUrl);
      return <Loader halfScreen />;
    }

    return <ErrorMessage message={"Sedang ada gangguan"} statusCode={400} />;
  }

  if (isLoading || isFetching || !attemptId) {
    return <ExamLoadingScreen title="Menyiapkan sesi ujian" />;
  }

  // Render respons kosong jika tidak ada pertanyaan
  if (!data?.questions?.length) {
    return (
      <div className="mt-10">
        <EmptyResponse resource="Quiz Questions" />
      </div>
    );
  }

  if (!response.length) {
    return <ExamLoadingScreen title="Menyusun urutan soal" />;
  }

  const examDuration = resolveExamDuration(data.duration);
  const answeredCount = response.filter((resp) => resp.response !== "").length;
  const totalQuestions = data.questions.length;
  const progressPercent = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;
  const examTitle = data.testName || params.slug[0] || "Ujian";
  const currentAnswered = Boolean(response[activeIndex]?.response);

  // Render komponen utama
  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-slate-100 lg:h-[calc(100vh-64px)] lg:min-h-[720px] lg:overflow-hidden">
      <div className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-700">
                {examTitle}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Paket #{packageId}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  isOffline
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {isOffline ? <FiWifiOff /> : <FiWifi />}
                {isOffline ? "Koneksi terputus" : "Online"}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-bold text-slate-950 md:text-2xl">
              Pengerjaan Try Out
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Soal aktif {activeIndex + 1} dari {totalQuestions}. Jawaban disimpan otomatis selama ujian berjalan.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <CountDown
              startAt={data.createdAt}
              duration={examDuration}
              totalPausedMs={(data.totalPausedMs || 0) + extraPausedMs}
              isPaused={isOffline}
              onTimeUp={onSubmitTimeUp}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={onSubmit}
              style={{
                minHeight: 48,
                borderRadius: 14,
                paddingInline: 22,
                textTransform: "none",
                fontWeight: 800,
                backgroundColor: "#0f766e",
              }}
            >
              Kumpulkan Jawaban
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-visible p-4 md:p-6 lg:overflow-hidden">
        {!quizEnd ? (
          <div className="grid min-h-full gap-4 lg:h-full lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="min-h-0 pr-0 lg:overflow-y-auto lg:pr-1">
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <ExamMetricCard
                  icon={<FiCheckCircle />}
                  label="Terjawab"
                  value={`${answeredCount}/${totalQuestions}`}
                  tone="teal"
                />
                <ExamMetricCard
                  icon={<FiClock />}
                  label="Durasi Paket"
                  value={`${examDuration} menit`}
                  tone="indigo"
                />
                <ExamMetricCard
                  icon={<FiShield />}
                  label="Status Soal"
                  value={currentAnswered ? "Sudah dijawab" : "Belum dijawab"}
                  tone={currentAnswered ? "teal" : "amber"}
                />
              </div>

              <div className="mb-4 space-y-3">
                {isOffline && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    <FiWifiOff className="mt-0.5 shrink-0" />
                    <p>
                    Koneksi terputus. Jawaban terakhir akan disimpan lagi saat koneksi kembali.
                    </p>
                  </div>
                )}
                {securityEventCount > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    <FiAlertTriangle className="mt-0.5 shrink-0" />
                    <p>
                    Aktivitas keluar tab/window terdeteksi {securityEventCount} kali dan tercatat.
                    </p>
                  </div>
                )}
              </div>

              {response && (
                <Player
                  questions={response}
                  response={response}
                  setResponse={setResponse}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  onResponseChange={saveResponse}
                />
              )}
            </section>

            <aside className="hidden min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <QuestionNavigator
                responses={response}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                progressPercent={progressPercent}
              />
            </aside>

            <div className="lg:hidden">
              <QuestionNavigator
                responses={response}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                progressPercent={progressPercent}
                compact
              />
            </div>

              <ModalSkeleton
                open={confirmSubmitModalActive}
                onClose={handleConfirmSubmitModalClose}
              >
                <ConfirmSubmitModalContent
                  handleConfirmSubmitModalClose={handleConfirmSubmitModalClose}
                  responses={response}
                  onConfirmSubmit={() => {
                    allowLeaveRef.current = true;
                    setIsSubmitConfirmed(true);
                  }}
                  attemptId={attemptId}
                />
              </ModalSkeleton>
              <ModalSkeleton
                open={leaveWarningOpen}
                onClose={() => setLeaveWarningOpen(false)}
              >
                <div className="p-8">
                  <p className="text-xl font-semibold text-gray-900">
                    Keluar dari ujian?
                  </p>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Ujian masih berjalan. Jawaban yang sudah tersimpan tetap aman,
                    tetapi timer akan tetap mengikuti aturan sesi. Pastikan Anda
                    benar-benar ingin meninggalkan halaman ini.
                  </p>
                  <div className="mt-8 flex justify-end gap-3">
                    <Button onClick={() => setLeaveWarningOpen(false)}>
                      Tetap di ujian
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={confirmLeaveExam}
                    >
                      Keluar
                    </Button>
                  </div>
                </div>
              </ModalSkeleton>
          </div>
        ) : (
          <ShowResponses
            as="AFTER_QUIZ_RESPONSE"
            score={score}
            responses={response}
          />
        )}
      </div>
    </div>
  );
}

function ExamMetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "teal" | "indigo" | "amber";
}) {
  const toneClass = {
    teal: "bg-teal-50 text-teal-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuestionNavigator({
  responses,
  activeIndex,
  setActiveIndex,
  answeredCount,
  totalQuestions,
  progressPercent,
  compact = false,
}: {
  responses: IResponse[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  answeredCount: number;
  totalQuestions: number;
  progressPercent: number;
  compact?: boolean;
}) {
  return (
    <div className={`flex h-full flex-col ${compact ? "rounded-2xl border border-slate-200 bg-white shadow-sm" : ""}`}>
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-950">Peta Soal</p>
            <p className="mt-1 text-xs text-slate-500">
              Pilih nomor untuk berpindah soal.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <FiGrid />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Progres</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {answeredCount} dari {totalQuestions} soal sudah dijawab.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-5 gap-2 xl:grid-cols-6">
          {responses.map((item, index) => {
            const isActive = index === activeIndex;
            const isAnswered = Boolean(item.response);

            return (
              <button
                key={item._id || index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex h-11 items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                  isActive
                    ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                    : isAnswered
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-teal-600" />
            Aktif
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-100 ring-1 ring-emerald-200" />
            Terjawab
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-100 ring-1 ring-slate-200" />
            Kosong
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamLoadingScreen({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sistem sedang mengambil data paket, jawaban tersimpan, dan timer ujian.
          Mohon tunggu sebentar.
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-indigo-600" />
        </div>
      </div>
    </div>
  );
}
