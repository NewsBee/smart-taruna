import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Option {
  id: string;
  content: string;
  label?: string;
  image?: string;
  percentage?: number;
}

interface Props {
  option: Option;
  selectedOptionId?: string;
  onClick?: () => void;
  disabled?: boolean;
  correctOptionId?: string;
  tipeSoal?: string;
}

export const OptionHasil: React.FC<Props> = ({
  option,
  selectedOptionId,
  onClick,
  disabled,
  correctOptionId,
  tipeSoal,
}) => {
  console.log(option)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const userSelectedCorrectOption = tipeSoal === "TKP" || (selectedOptionId === correctOptionId && selectedOptionId === option.id);
  const isCorrectOption = tipeSoal === "TKP" || correctOptionId === option.id;
  const isUserSelectedOption = selectedOptionId === option.id;

  const getClasses = () => {
    let baseClasses = `flex items-center px-4 py-2 border w-full text-left mt-4 rounded-md disabled:opacity-80 transition-all duration-300 cursor-pointer`;

    if (isCorrectOption) {
      if (isUserSelectedOption) {
        return `${baseClasses} bg-green-700 border-green-700 text-white`;
      } else {
        return `${baseClasses} bg-green-500 border-green-500 text-white`;
      }
    } else if (isUserSelectedOption) {
      return `${baseClasses} bg-red-500 border-red-500 text-white`;
    }

    return `${baseClasses} border-gray-300`;
  };

  const classes = getClasses();

  const openLightbox = (imageSrc: string) => {
    setIsLightboxOpen(true);
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className =
      "fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center";
    lightbox.onclick = () => {
      setIsLightboxOpen(false);
      document.body.removeChild(lightbox);
    };

    const closeBtn = document.createElement("span");
    closeBtn.className =
      "absolute top-4 right-4 text-white text-4xl cursor-pointer";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      setIsLightboxOpen(false);
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

  return (
    <div className="w-full">
      <button onClick={onClick} className={classes} disabled={disabled}>
        <div className="flex items-start w-full">
          {option.image && (
            <img
              src={option.image || ""}
              alt={`Option ${option.label} Image`}
              className="w-24 h-24 object-contain mb-2 rounded-md border cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(option.image || "");
              }}
            />
          )}
          <div className="flex-1 ml-4">
            <div className="flex items-center">
              {isCorrectOption && (
                <CheckCircleIcon className="h-5 w-5 text-white mr-2" />
              )}
              {option.label && (
                <p style={{ wordBreak: 'break-word' }} className="text-sm md:text-base font-semibold">
                  {option.label}
                </p>
              )}
            </div>
            <div className="relative w-full mt-2 bg-gray-200 rounded-full h-2.5">
              <div
                className="absolute top-0 left-0 h-2.5 bg-blue-500 rounded-full"
                style={{ width: `${option.percentage ?? 0}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${isUserSelectedOption && isCorrectOption ? 'text-yellow-500' : 'text-gray-600'}`}>
              {(option.percentage ?? 0).toFixed(2)}% memilih ini
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};
