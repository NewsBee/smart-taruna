import React from 'react';
import { IQuestion, IResponse } from "../shared/interfaces";

interface BottomBarProps {
  questions: IQuestion[];
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  responses: IResponse[];
}

export const BottomBar: React.FC<BottomBarProps> = ({
    activeIndex,
    setActiveIndex,
    questions,
    responses,
  }) => {
    return (
      <div className={`mt-3 flex flex-row justify-start items-center px-2 py-2 overflow-x-auto border-t border-gray-300 bg-white`}>
        {questions.map((_, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`cursor-pointer flex justify-center items-center mx-1 ${
              index === activeIndex ? 'bg-indigo-600' : responses[index]?.response ? 'bg-green-500' : 'bg-gray-200'
            }`}
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <span className={`text-sm font-bold ${index === activeIndex || responses[index]?.response ? 'text-white' : 'text-black'}`}>
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    );
  };
  