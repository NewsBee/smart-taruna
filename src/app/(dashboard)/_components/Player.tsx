import React, { useEffect, useState } from "react";
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
}

export const Player: React.FC<Props> = ({
  questions,
  activeIndex,
  setActiveIndex,
  response,
  setResponse,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");

  const onOptionClick = (optionId: string) => {
    // console.log("Selected option:", optionId);
    setSelectedOptionId(optionId);
    setResponse((res) =>
      res.map((r, index) =>
        index === activeIndex ? { ...r, response: optionId } : r
      )
    );
  };

  const openLightbox = (imageSrc: string) => {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className =
      "fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center";
    lightbox.onclick = () => {
      document.body.removeChild(lightbox);
    };

    const closeBtn = document.createElement("span");
    closeBtn.className =
      "absolute top-4 right-4 text-white text-4xl cursor-pointer";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      document.body.removeChild(lightbox);
    };

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Full size preview";
    img.className = "max-w-full h-auto max-h-[80vh] mx-auto";

    lightbox.appendChild(closeBtn);
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
  };

  useEffect(() => {
    setSelectedOptionId(response[activeIndex]?.response || "");
    // console.log("Current response:", response[activeIndex]?.response);
  }, [activeIndex, response]);

  return (
    <div className="flex-1 flex-grow px-4 py-5 min-h-[86%] flex flex-col text-sm md:text-base">
      {questions && questions[activeIndex].image && (
        <div className="my-4 sm:my-0 sm:mr-4 flex-shrink-0">
          <img
            src={questions[activeIndex].image}
            alt="Question Image"
            className="w-full max-w-md h-auto object-contain cursor-pointer"
            onClick={() => openLightbox(questions[activeIndex].image || "")}
          />
        </div>
      )}
      <p className="break-words whitespace-pre-wrap mb-4">
        {questions && questions[activeIndex].title}
      </p>

      <div className="flex flex-col items-start">
        {questions &&
          questions[activeIndex]?.options?.map((option: IOption, i: number) => (
            <Option
              key={option._id}
              onClick={() => onOptionClick(option._id || "")}
              selectedOptionId={selectedOptionId}
              option={option}
            />
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
