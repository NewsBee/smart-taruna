interface Props {
  option: { value: string };
  index?: number;
  selectedOption?: string;
  onClick?: () => void;
  disabled?: boolean;
  correctAns?: string;
}

export const Option: React.FC<Props> = ({
  option,
  index,
  selectedOption,
  onClick,
  disabled,
  correctAns,
}) => {
  const isSelected = selectedOption === option.value;
  const userSelectedCorrectOption =
    selectedOption === option.value && option.value === correctAns;
  const optionLetter =
    typeof index === "number" ? String.fromCharCode(65 + index) : "";

  const getClasses = () => {
    return `group flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200 disabled:opacity-80 ${
      isSelected
        ? "border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-100"
        : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50"
    } ${correctAns === option.value ? "border-indigo-600 bg-indigo-600" : ""} ${
      userSelectedCorrectOption ? "border-blue-600 bg-blue-600" : ""
    }`;
  };

  const classes = getClasses();

  return (
    <button disabled={disabled} onClick={onClick} className={classes}>
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
          isSelected
            ? "border-teal-600 bg-teal-600 text-white"
            : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-teal-300 group-hover:text-teal-700"
        } ${
          correctAns === option.value || userSelectedCorrectOption
            ? "border-white/40 bg-white/20 text-white"
            : ""
        }`}
      >
        {optionLetter || "•"}
      </div>
      <p
        style={{
          wordBreak: "break-word",
        }}
        className={`pt-1 text-sm leading-7 md:text-base ${
          correctAns === option.value || userSelectedCorrectOption
            ? "text-white"
            : "text-slate-800"
        }`}
      >
        {option.value}
      </p>
    </button>
  );
};
