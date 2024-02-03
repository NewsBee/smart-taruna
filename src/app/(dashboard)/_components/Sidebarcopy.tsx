import { useMediaQuery } from "@material-ui/core";
import { Dispatch, SetStateAction } from "react";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { IQuestion } from "../shared/interfaces";

interface Props {
  questions: IQuestion[];
  activeIndex?: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
}

export const Sidebarcopy: React.FC<Props> = ({
  activeIndex,
  setActiveIndex,
  questions,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <div
      className={`flex h-full ${isMobile ? 'flex-row' : 'flex-col'} overflow-x-auto border-l border-gray-300 transition-all duration-300`}
      style={{ width: isMobile ? 'auto' : '56px' }}
    >
      <div className="flex items-center overflow-x-auto">
        {questions?.map((quiz, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex items-center cursor-pointer p-2 ${
              activeIndex === index ? "bg-indigo-600" : "bg-green-100"
            }`}
          >
            <p
              className={`text-sm rounded-full ${
                activeIndex === index
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {index + 1}
            </p>
            <p className="pl-4">
              {quiz.title.length > 30 ? quiz.title.slice(0, 30) + "..." : quiz.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
