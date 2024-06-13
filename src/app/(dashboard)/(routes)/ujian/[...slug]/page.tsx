"use client";

import { Box, Button, CircularProgress } from "@material-ui/core";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { ConfirmSubmitModalContent } from "../../../_components/ConfirmSubmitModal";
import { EmptyResponse } from "../../../_components/EmptyResponse";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { ModalSkeleton } from "../../../_components/Modal";
import { Player } from "../../../_components/Player";
import { Loader } from "../../../_components/Svgs";
import { errorMessages } from "../../../shared/constants";
import { IOption, IQuestion, IResponse } from "../../../shared/interfaces";
import { useQuizQuestions } from "../../../shared/queries";
import { useParams } from "next/navigation";
import axios from "axios";
import { Sidebarcopy } from "@/app/(dashboard)/_components/Sidebarcopy";
import { Sidebar } from "@/app/(dashboard)/_components/Sidebar";
import CountDown from "@/app/(dashboard)/_components/CountDown";
import { BottomBar } from "@/app/(dashboard)/_components/BottomBar";
import { useRouter } from "next/navigation";

// interface IOption {
//   value: string;
//   label: string;
// }


const options1: IOption[] = [
  { value: "A", _id: "opt1" },
  { value: "B", _id: "opt2" },
  { value: "C", _id: "opt3" },
];

const options2: IOption[] = [
  { value: "D", _id: "opt4" },
  { value: "E", _id: "opt5" },
  { value: "F", _id: "opt6" },
];

const dummyQuestions: IQuestion[] = [
  { _id: "1", title: "Pertanyaan 1", quiz: "Quiz 1", options: options1 },
  { _id: "2", title: "Pertanyaan 2", quiz: "Quiz 2", options: options2 },
];

const dummyResponses: IResponse[] = dummyQuestions.map((question) => ({
  ...question,
  response: "", // Atau isi dengan nilai default jika diperlukan
}));

// Data dummy untuk questions dan responses
// const dummyQuestions = [
//   { _id: "1", title: "Pertanyaan 1", quiz: "Quiz 1", options: ["A", "B", "C"] },
//   { _id: "2", title: "Pertanyaan 2", quiz: "Quiz 2", options: ["D", "E", "F"] },
// ];

// const dummyResponses: IResponse[] = dummyQuestions.map((q) => ({
//   _id: q._id,
//   title: q.title,
//   quiz: q.quiz,
//   response: "",
//   options: q.options.map((option) => ({ value: option, label: option })), // Adjust this line
// }));

export default function PlayerScreen({
  params,
}: {
  params: { slug: string[] };
}) {
  // Gunakan useParams dummy jika diperlukan
  const packageId = parseInt(params.slug[1]);

  const { data, isLoading, isFetching, error } = useQuizQuestions(
    parseInt(params.slug[1])
  );
  // console.log(params.slug[0]);
  // console.log(data);
  const [activeIndex, setActiveIndex] = useState(0);
  const [response, setResponse] = useState<IResponse[]>(dummyResponses);
  const [quizEnd, setQuizEnd] = useState(false);
  const [isSubmitConfirmed, setIsSubmitConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
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
      router.push(`/hasil/${attemptId}`); // Sesuaikan path navigasi sesuai kebutuhan
    } catch (error) {
      console.error("Error submitting quiz:", error);
      enqueueSnackbar("Gagal mengirim jawaban.", { variant: "error" });
    }
  };

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
        quiz: data.testName, // Nama tes, misalnya 'SKD'
        response: "",
        options: q.choices.map((choice: any) => ({
          value: choice.content,
          label: choice.content,
          image: choice.image || "",
        })),
      }));
      setResponse(newResponses);
    }
  }, [data, packageId]);
  // console.log(response)

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
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
                    onTimeUp={onSubmitTimeUp}
                  />
                </p>
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
                  onConfirmSubmit={() => setIsSubmitConfirmed(true)}
                  attemptId={attemptId}
                />
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
