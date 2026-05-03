"use client";

import { Box, Button, CircularProgress } from "@material-ui/core";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmSubmitModalContent } from "../../../_components/ConfirmSubmitModal";
import { EmptyResponse } from "../../../_components/EmptyResponse";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { ModalSkeleton } from "../../../_components/Modal";
import { Player } from "../../../_components/Player";
import { Loader } from "../../../_components/Svgs";
import { errorMessages } from "../../../shared/constants";
import { IResponse } from "../../../shared/interfaces";
import { useQuizQuestions } from "../../../shared/queries";
import axios from "axios";
import { Sidebarcopy } from "@/app/(dashboard)/_components/Sidebarcopy";
import { Sidebar } from "@/app/(dashboard)/_components/Sidebar";
import CountDown from "@/app/(dashboard)/_components/CountDown";
import { BottomBar } from "@/app/(dashboard)/_components/BottomBar";
import { useRouter } from "next/navigation";

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

  if (!attemptId) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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

  // Render respons kosong jika tidak ada pertanyaan
  if (!data || data.length === 0) {
    return (
      <div className="mt-10">
        <EmptyResponse resource="Quiz Questions" />
      </div>
    );
  }

  // Render komponen utama
  return isLoading || isFetching ? (
    <Loader halfScreen />
  ) : (
    <div
      style={{ height: "92vh" }}
      className="w-full flex flex-col flex-1 overflow-y-hidden"
    >
      <div className="flex flex-row flex-1 overflow-y-auto">
        {!quizEnd ? (
          <>
            {/* <Sidebar
              responses={response}
              questions={response}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            /> */}
            <div className="flex-1 overflow-y-auto">
              <div className="min-h-[8%] border-b border-t border-gray-300 flex px-4 py-4 justify-between">
                <p className="mt-auto hidden sm:block">
                  Pertanyaan {activeIndex + 1}
                  <CountDown
                    startAt={data.createdAt}
                    duration={data.duration}
                    totalPausedMs={(data.totalPausedMs || 0) + extraPausedMs}
                    isPaused={isOffline}
                    onTimeUp={onSubmitTimeUp}
                  />
                </p>
                {isOffline && (
                  <p className="mt-auto rounded bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800">
                    Koneksi terputus. Jawaban terakhir akan disimpan lagi saat koneksi kembali.
                  </p>
                )}
                {securityEventCount > 0 && (
                  <p className="mt-auto rounded bg-rose-100 px-3 py-2 text-sm font-medium text-rose-700">
                    Aktivitas keluar tab/window terdeteksi {securityEventCount} kali dan tercatat.
                  </p>
                )}
                {!quizEnd && (
                  <div className="flex items-center justify-center flex-col sm:flex-row mt-auto">
                    <p className="sm:mr-4 mb-3 sm:mb-0 text-sm md:text-base">
                      {response?.filter((resp) => resp.response !== "").length}/{" "}
                      {data?.questions.length} Diisi
                    </p>
                    <div className="bg-gray-200 rounded-full h-1 w-28 md:w-48">
                      <div
                        className="bg-indigo-600 rounded-full h-1"
                        style={{
                          width: `${
                            (response?.filter((resp) => resp.response !== "")
                              .length /
                              data?.questions.length) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                <Button variant="contained" color="primary" onClick={onSubmit}>
                  Submit
                </Button>
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

              {/* <BottomBar
                responses={response}
                questions={response}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              /> */}
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
          </>
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
