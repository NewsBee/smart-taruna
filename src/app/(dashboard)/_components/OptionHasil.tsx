import React from 'react';

interface Props {
  option: { value: string };
  selectedOption?: string;
  onClick?: () => void;
  disabled?: boolean;
  correctAns?: string;
  tipeSoal?: string;
}

export const OptionHasil: React.FC<Props> = ({
  option,
  selectedOption,
  onClick,
  disabled,
  correctAns,
  tipeSoal,
}) => {
//   // Cek apakah jawaban yang dipilih pengguna itu benar
//   const userSelectedCorrectOption = selectedOption === correctAns && selectedOption === option.value;

//   // Cek apakah opsi ini adalah jawaban yang benar
//   const isCorrectOption = correctAns === option.value;

  // Cek apakah jawaban yang dipilih pengguna itu benar atau semua jawaban dianggap benar untuk TPA
  const userSelectedCorrectOption = tipeSoal === "TKP" || (selectedOption === correctAns && selectedOption === option.value);

  // Cek apakah opsi ini adalah jawaban yang benar atau semua jawaban dianggap benar untuk TKP
  const isCorrectOption = tipeSoal === "TKP" || correctAns === option.value;

  // Cek apakah opsi ini adalah yang dipilih oleh pengguna
  const isUserSelectedOption = selectedOption === option.value;

  const getClasses = () => {
    let baseClasses = `grid grid-cols-auto-1fr items-center px-4 py-2 border w-full text-left mt-4 rounded-md disabled:opacity-80 transition-all duration-300 cursor-pointer`;

    if (tipeSoal === "TKP") {
      // Untuk TKP, semua opsi dianggap benar
      return `${baseClasses} bg-green-500 border-green-500 text-white`;
    } else if (userSelectedCorrectOption) {
      // User memilih jawaban yang benar
      return `${baseClasses} bg-green-700 border-green-700 text-white`;
    } else if (isCorrectOption) {
      // Opsi ini adalah jawaban yang benar tetapi tidak dipilih oleh pengguna
      return `${baseClasses} bg-green-500 border-green-500 text-white`;
    } else if (isUserSelectedOption) {
      // User memilih opsi ini tetapi tidak benar
      return `${baseClasses} bg-red-500 border-red-500 text-white`;
    }
    // if (userSelectedCorrectOption) {
    //   // User memilih jawaban yang benar
    //   return `${baseClasses} bg-green-700 border-green-700 text-white`;
    // } else if (isCorrectOption) {
    //   // Opsi ini adalah jawaban yang benar tetapi tidak dipilih oleh pengguna
    //   return `${baseClasses} bg-green-500 border-green-500 text-white`;
    // } else if (isUserSelectedOption) {
    //   // User memilih opsi ini tetapi tidak benar
    //   return `${baseClasses} bg-red-500 border-red-500 text-white`;
    // }

    // Default style untuk opsi lainnya
    return `${baseClasses} border-gray-300`;
  };

  const classes = getClasses();

  return (
    <button disabled={disabled} onClick={onClick} className={classes}>
      <p style={{ wordBreak: 'break-word' }} className="text-sm md:text-base">
        {option.value}
      </p>
    </button>
  );
};

