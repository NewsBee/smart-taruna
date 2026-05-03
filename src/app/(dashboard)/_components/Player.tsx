import { useEffect, useState } from "react";
import { IOption, IQuestion, IResponse } from "../shared/interfaces";
import { Option } from "./Option";
import { PaginationButton } from "./PaginationButton";
import { BottomBar } from "./BottomBar";

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
    // console.log(response)
    setSelectedOption(option);
    setResponse((res) =>
      res.map((r, index) =>
        index === activeIndex ? { ...r, response: option } : r
      )
    );
    onResponseChange?.(questions[activeIndex]._id, option);
  };

  const onInputChange = (answer: string) => {
    setSelectedOption(answer);
    setResponse((res) =>
      res.map((r, index) =>
        index === activeIndex ? { ...r, response: answer } : r
      )
    );
    onResponseChange?.(questions[activeIndex]._id, answer);
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
  // console.log(questions)

  return (
    <div className="flex-1 flex-grow px-4 py-5 min-h-[86%] flex flex-col text-sm md:text-base">
      {questions && questions[activeIndex].image && (
        <div className="my-4 flex justify-start">
          <img
            src={questions[activeIndex].image}
            alt="Question Image"
            className="max-w-md max-h-[300px] object-contain cursor-zoom-in"
            // onClick={() => window.open(questions[activeIndex].image, '_blank')} // Membuka gambar di tab baru ketika diklik
          />
        </div>
      )}
      <p className="break-words">{questions && questions[activeIndex].title}</p>
      <div className="flex flex-col items-start">
        {/* {questions &&
          questions[activeIndex].options.map((option: IOption, i: number) => (
            <Option
              key={i}
              onClick={() => onOptionClick(option.value)}
              selectedOption={selectedOption}
              option={option}
            />
          ))} */}
        {questions &&
          (questions[activeIndex]?.answerType === "SHORT_TEXT" ||
          questions[activeIndex]?.answerType === "NUMERIC" ? (
            <input
              className="mt-4 w-full rounded-md border border-gray-300 px-4 py-3 text-sm md:text-base outline-none focus:border-indigo-600"
              type={questions[activeIndex]?.answerType === "NUMERIC" ? "number" : "text"}
              value={selectedOption}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Ketik jawaban"
            />
          ) : (
          questions[activeIndex]?.options?.map((option: IOption, i: number) => (
            <Option
              key={i}
              onClick={() => onOptionClick(option.value)}
              selectedOption={selectedOption}
              option={option}
            />
          ))
          ))}
      </div>
      <div className="w-full flex items-center justify-between mt-10">
        <PaginationButton
          onClick={() => {
            setActiveIndex((p: number) => p - 1);
          }}
          disabled={activeIndex === 0}
          title="Previous Question"
        />

        <PaginationButton
          onClick={() => {
            setActiveIndex((p) => p + 1);
          }}
          title="Next Question"
          disabled={activeIndex === questions?.length - 1}
        />
      </div>
      <BottomBar
        questions={questions}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        responses={response}
      />
    </div>
  );
};
