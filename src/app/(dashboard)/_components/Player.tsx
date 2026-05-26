import { useEffect, useState } from "react";
import { IOption, IQuestion, IResponse } from "../shared/interfaces";
import { Option } from "./Option";
import { PaginationButton } from "./PaginationButton";

interface Props {
  questions: IQuestion[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  response: IResponse[];
  setResponse: React.Dispatch<React.SetStateAction<IResponse[] | []>>;
  onResponseChange?: (questionId: string, answer: string) => void;
}

export const Player: React.FC<Props> = ({
  questions,
  activeIndex,
  setActiveIndex,
  response,
  setResponse,
  onResponseChange,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const currentQuestion = questions?.[activeIndex];

  // const onOptionClick = (option: string) => {
  //   setSelectedOption(option);
  //   setResponse((res) => {
  //     const newRes: IResponse[] = [];
  //     res.forEach((resp) => {
  //       newRes.push({
  //         ...resp,
  //         response:
  //           resp._id === questions[activeIndex]._id ? option : resp.response,
  //       });
  //     });
  //     return newRes;
  //   });
  // };
  const onOptionClick = (option: string) => {
    if (!currentQuestion) return;
    // console.log(response)
    setSelectedOption(option);
    setResponse((res) =>
      res.map((r, index) =>
        index === activeIndex ? { ...r, response: option } : r
      )
    );
    onResponseChange?.(currentQuestion._id, option);
  };

  const onInputChange = (answer: string) => {
    if (!currentQuestion) return;
    setSelectedOption(answer);
    setResponse((res) =>
      res.map((r, index) =>
        index === activeIndex ? { ...r, response: answer } : r
      )
    );
    onResponseChange?.(currentQuestion._id, answer);
  };

  // useEffect(() => {
  //   const currentQuestionResponse = response && response[activeIndex]?.response;
  //   if (currentQuestionResponse) {
  //     setSelectedOption(currentQuestionResponse);
  //   }
  //   return () => {
  //     setSelectedOption("");
  //   };
  // }, [activeIndex, response]);
  useEffect(() => {
    setSelectedOption(response[activeIndex]?.response || "");
  }, [activeIndex, response]);

  useEffect(() => {
    if (!questions?.length) return;
    if (activeIndex < 0) setActiveIndex(0);
    if (activeIndex > questions.length - 1) setActiveIndex(questions.length - 1);
  }, [activeIndex, questions, setActiveIndex]);
  // console.log(questions)

  if (!questions?.length || !currentQuestion) {
    return (
      <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <p className="mt-5 text-base font-semibold text-slate-900">
          Menyiapkan soal ujian
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Sistem sedang mengambil urutan soal dan jawaban yang sudah tersimpan.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Soal {activeIndex + 1}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              selectedOption
                ? "bg-teal-50 text-teal-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {selectedOption ? "Sudah dijawab" : "Belum dijawab"}
          </span>
          {currentQuestion.answerType && currentQuestion.answerType !== "MULTIPLE_CHOICE" && (
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Jawaban singkat
            </span>
          )}
        </div>
      {currentQuestion.image && (
        <div className="mb-6 flex justify-start overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
          <img
            src={currentQuestion.image}
            alt="Question Image"
            className="max-h-[320px] max-w-full cursor-zoom-in object-contain"
            // onClick={() => window.open(questions[activeIndex].image, '_blank')} // Membuka gambar di tab baru ketika diklik
          />
        </div>
      )}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:p-5">
          <p className="whitespace-pre-line break-words text-base leading-8 text-slate-900 md:text-lg">
            {currentQuestion.title}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Pilihan Jawaban</p>
          <p className="text-xs font-medium text-slate-500">
            Jawaban tersimpan otomatis
          </p>
        </div>
        <div className="flex flex-col gap-3">
        {/* {questions &&
          questions[activeIndex].options.map((option: IOption, i: number) => (
            <Option
              key={i}
              onClick={() => onOptionClick(option.value)}
              selectedOption={selectedOption}
              option={option}
            />
          ))} */}
        {currentQuestion.answerType === "SHORT_TEXT" ||
          currentQuestion.answerType === "NUMERIC" ? (
            <input
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 md:text-base"
              type={currentQuestion.answerType === "NUMERIC" ? "number" : "text"}
              value={selectedOption}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Ketik jawaban"
            />
          ) : (
          currentQuestion.options?.map((option: IOption, i: number) => (
            <Option
              key={i}
              index={i}
              onClick={() => onOptionClick(option.value)}
              selectedOption={selectedOption}
              option={option}
            />
          ))
          )}
        </div>
      </div>
      <div className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <PaginationButton
          onClick={() => {
            setActiveIndex((p: number) => Math.max(p - 1, 0));
          }}
          disabled={activeIndex === 0}
          title="Previous Question"
        />

        <PaginationButton
          onClick={() => {
            setActiveIndex((p) => Math.min(p + 1, questions.length - 1));
          }}
          title="Next Question"
          disabled={activeIndex === questions?.length - 1}
        />
      </div>
    </div>
  );
};
