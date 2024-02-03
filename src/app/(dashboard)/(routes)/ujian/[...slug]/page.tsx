"use client";

import { Button } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { ConfirmSubmitModalContent } from "../../../_components/ConfirmSubmitModal";
import { EmptyResponse } from "../../../_components/EmptyResponse";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { ModalSkeleton } from "../../../_components/Modal";
import { Player } from "../../../_components/Player";
import { Loader } from "../../../_components/Svgs";
import { errorMessages } from "../../../shared/constants";
import { IQuestion, IResponse } from "../../../shared/interfaces";
import { useQuizQuestions } from "../../../shared/queries";
import { useParams } from "next/navigation";
import axios from "axios";
import { Sidebarcopy } from "@/app/(dashboard)/_components/Sidebarcopy";
import { Sidebar } from "@/app/(dashboard)/_components/Sidebar";
import CountDown from "@/app/(dashboard)/_components/CountDown";
import { BottomBar } from "@/app/(dashboard)/_components/BottomBar";

interface IOption {
  value: string;
  label: string;
}

// Data dummy untuk questions dan responses
const dummyQuestions = [
  { _id: "1", title: "Pertanyaan 1", quiz: "Quiz 1", options: ["A", "B", "C"] },
  { _id: "2", title: "Pertanyaan 2", quiz: "Quiz 2", options: ["D", "E", "F"] },
];

const dummyResponses: IResponse[] = dummyQuestions.map((q) => ({
  _id: q._id,
  title: q.title,
  quiz: q.quiz,
  response: "",
  options: q.options.map((option) => ({ value: option, label: option })), // Adjust this line
}));

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
  const [response, setResponse] = useState<IResponse[]>([dummyResponses]);
  const [quizEnd, setQuizEnd] = useState(false);
  const [isSubmitConfirmed, setIsSubmitConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [confirmSubmitModalActive, setConfirmSubmitModalActive] =
    useState(false);

  const handleConfirmSubmitModalOpen = () => setConfirmSubmitModalActive(true);
  const handleConfirmSubmitModalClose = () =>
    setConfirmSubmitModalActive(false);

  const onSubmit = () => {
    handleConfirmSubmitModalOpen();
  };

  // Fungsi dummy untuk menghitung skor
  const findScore = () => {
    setQuizEnd(true);
    // Logic penghitungan skor dummy
    let dummyScore = 10; // Ganti dengan logika penghitungan skor Anda
    setScore(dummyScore);
  };

  useEffect(() => {
    if (data && data.questions) {
      // Mengubah data soal menjadi format yang dibutuhkan oleh state response
      const newResponses = data.questions.map((q: any) => ({
        _id: q.id.toString(),
        title: q.content,
        quiz: data.testName, // Nama tes, misalnya 'SKD'
        response: "",
        options: q.choices.map((choice: any) => ({
          value: choice.content,
          label: choice.content,
        })),
      }));
      setResponse(newResponses);
    }
  }, [data, packageId]);

  useEffect(() => {
    console.log("Responses:", data);
  }, [data]);

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
                    onTimeUp={onSubmit}
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
              <Player
                questions={response}
                response={response}
                setResponse={setResponse}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
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
