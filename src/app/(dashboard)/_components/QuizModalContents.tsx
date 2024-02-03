import { Button, styled } from "@material-ui/core";
import { IQuiz } from "../shared/interfaces";
import { useRouter } from "next/navigation";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";

interface Props extends IQuiz {
  onSelect?: () => void;
  score?: number;
  deleted?: boolean;
  redirect?: string;
  selected?: boolean;
  onClose: () => void;
  currTest?: string;
  duration?: number;
}


export const QuizModalContents: React.FC<Props> = ({
  onClose,
  title,
  description,
  tags = [],
  attemptsCount,
  questionsCount,
  _id,
  currTest,
  duration,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/ujian/start/${_id}`);
      // Jika berhasil, navigasikan ke halaman quiz
      console.log(response);
      router.push(`/ujian/${currTest}/${response.data.attemptId}`);
      setIsLoading(false);
    } catch (error: any) {
      // Jika gagal, cek apakah pengguna sedang mengerjakan paket soal lain
      if (
        error.response &&
        error.response.data &&
        error.response.data.attemptId
      ) {
        // Redirect ke paket soal yang sedang dikerjakan
        router.push(`/ujian/${currTest}/${error.response.data.attemptId}`);
      } else {
        // Jika tidak ada data paket soal yang sedang dikerjakan, tampilkan pesan kesalahan
        console.error("Error starting quiz: ", error);
      }
    } 
  };

  // const handleBeginClick = async () => {
  //   setIsLoading(true);

  //   try {
  //     // Ganti dengan endpoint Anda untuk memeriksa status quiz pengguna
  //     const res = await fetch(`/api/check-quiz-status`);
  //     const data = await res.json();

  //     if (data.isTakingQuiz && data.currentPackageId !== _id) {
  //       // Pengguna sedang mengerjakan quiz lain
  //       router.push(`/ujian/${data.currentTestName}/${data.currentPackageId}`);
  //     } else {
  //       // Pengguna tidak sedang mengerjakan quiz lain, atau quiz yang sama
  //       router.push(`/ujian/${currTest}/${_id}`);
  //     }
  //   } catch (error) {
  //     console.error("Error checking quiz status:", error);
  //   } 
  // };
  return (
    <div className="p-5 md:p-10 overflow-hidden">
      <div style={{ maxHeight: "500px" }} className="overflow-auto">
        <div>
          <p className="text-xl font-medium">Ujian {title} <span className="px-3 ml-2 py-0.5 text-xs w-fit rounded-md font-medium text-white bg-gray-700"> {duration} menit </span> </p>
          <p className="my-6">{description}</p>
          <div className="grid items-center mb-2 grid-quiz-modal-descriptions">
            {!attemptsCount ? (
              <p className="my-6 font-semibold">
                Anda belum pernah mengerjakan paket ini
              </p>
            ) : (
              <>
                {/* <Typography
                  component="h2"
                  sx={{
                    position: "relative",
                    fontSize: { xs: 18, md: 24 },
                    letterSpacing: 2,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    marginBottom: 2,
                    color: "#303030", // Adjust the color to match your theme
                    fontStyle: "italic",
                  }}
                >
                  Anda telah mengikuti ujian:
                </Typography>
                <CountBadge>{attemptsCount}</CountBadge>kali */}
                <div className="my-6 font-semibold">
                  Anda telah mengikuti ujian ini
                  <p className=" px-3 py-0.5 text-xs w-fit rounded-md font-medium text-white bg-emerald-500">
                    {attemptsCount} kali
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="items-center grid grid-quiz-modal-descriptions">
            <div className="mb-4 font-semibold">
              Jumlah Soal
              <p className=" px-3 py-0.5 text-xs w-fit rounded-md font-medium text-white bg-yellow-400">
                {questionsCount} soal
              </p>
            </div>
          </div>

          <div className="flex mt-2 flex-wrap">
            {tags.map((tag, i) => (
              <p
                key={i}
                style={{
                  boxShadow: "0 5px 10px rgba(0,0,0,0.07)",
                  fontSize: "11px",
                  letterSpacing: "0.1px",
                  maxWidth: 100,
                }}
                className="mr-5 mt-2 text-xs py-0.5 px-2 bg-slate-300 rounded font-medium text-gray-700 break-words"
              >
                {tag}
              </p>
            ))}
          </div>
        </div>
        <div className="mt-10 flex justify-end">
          <div className="mr-4">
            <Button onClick={onClose} variant="outlined" color="secondary">
              Close
            </Button>
          </div>
          <Button onClick={startQuiz} variant="contained" color="secondary">
            {isLoading ? ( // Mengganti konten button saat loading
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v4c-4.418 0-8-3.582-8-8h4zM20 12h4a8 8 0 01-8 8v-4c3.627 0 6.373-2.373 8-5.627z"
                ></path>
              </svg>
            ) : (
              "Mulai"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
