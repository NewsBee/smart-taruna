import React from "react";

interface Props {
  option: { _id: string; value: string; image?: string };
  selectedOptionId?: string;
  onClick: () => void;
  disabled?: boolean;
  correctAns?: string;
}

export const Option: React.FC<Props> = ({
  option,
  selectedOptionId,
  onClick,
  disabled,
  correctAns,
}) => {
  const isSelected = selectedOptionId === option._id;

  const getClasses = () => {
    return `flex items-center px-4 py-2 border w-full text-left mt-4 rounded-md disabled:opacity-80 transition-all duration-300${
      isSelected ? " border-indigo-600 bg-indigo-100" : " border-gray-300"
    }${correctAns === option.value ? " bg-indigo-600 text-white" : ""}`;
  };

  const classes = getClasses();

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

  return (
    <button
      disabled={disabled}
      onClick={() => onClick()}
      className={classes}
    >
      <div className="flex items-center">
        <div
          className={`flex items-center justify-center border-2 w-6 h-6 rounded-full mr-4${
            isSelected ? " border-indigo-600" : " border-gray-300"
          }`}
        >
          {isSelected && (
            <div className="bg-indigo-600 w-3 h-3 rounded-full"></div>
          )}
        </div>
        <div className="flex flex-col items-center">
          {option.image && (
            <img
              src={option.image}
              alt={`Option ${option.value} Image`}
              className="w-full max-w-md sm:w-48 h-auto object-cover mb-2 rounded-md border cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(option.image || "");
              }}
            />
          )}
          <p
            style={{
              wordBreak: "break-word",
            }}
            className={`text-sm md:text-base ${
              correctAns === option.value ? "text-white" : ""
            }`}
          >
            {option.value}
          </p>
        </div>
      </div>
    </button>
  );
};
