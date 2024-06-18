import { Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import { IResponse } from "../shared/interfaces";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

interface Props {
  handleConfirmSubmitModalClose: () => void;
  isQuizCorrectAnsLoading?: boolean;
  setFetchCorrectAns?: React.Dispatch<React.SetStateAction<boolean>>;
  responses: [] | IResponse[];
  attemptId: number;
  onConfirmSubmit?: () => void; // Tambahkan baris ini
}

export const ConfirmSubmitModalContent: React.FC<Props> = ({
  handleConfirmSubmitModalClose,
  isQuizCorrectAnsLoading,
  setFetchCorrectAns,
  responses,
  attemptId,
  onConfirmSubmit, // Pastikan prop ini diterima
}) => {
  const [marked, setMarked] = useState(0);
  const [unmarked, setUnmarked] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // const [attemptId, setAttemptId] = useState(null);
  const router = useRouter()
  // console.log(responses)

  const handleSubmitAnswers = async () => {
    setIsLoading(true);
    try {
      // Call your API to submit the responses
      const res = await axios.post('/api/ujian/submit', { attemptId, responses });
      console.log('Submit response:', res.data);
      handleConfirmSubmitModalClose();
      // Handle post-submit actions (e.g., navigate to results page)
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally{
      setIsLoading(false);
      router.push(`/hasil/${attemptId}`)
    }
  };

  // useEffect(() => {
  //   const fetchAttemptId = async () => {
  //     try {
  //       const response = await axios.get('/api/ujian/check');
  //       setAttemptId(response.data.attemptId);
  //     } catch (error) {
  //       console.error('Error fetching current attempt:', error);
  //       // Handle error (misalnya menampilkan pesan error)
  //     }
  //   };

  //   fetchAttemptId();
  // }, []);

  // console.log(attemptId)
  // console.log(attempt)

  useEffect(() => {
    let markedCount = 0;
    let unmarkedCount = 0;
    responses.forEach(res => {
      if (res.response === "") {
        unmarkedCount++;
      } else {
        markedCount++;
      }
    });
    setMarked(markedCount);
    setUnmarked(unmarkedCount);
  }, [responses]);

  return (
    <>
      <h4 className="text-gray-555 text-center font-semibold text-2xl mt-3 mb-8">
        Kirim Jawaban
      </h4>
      <div className="my-4 mb-5 mx-5 md:mx-10">
        <p className="text-gray-555 text-sm md:text-lg font-medium">
          Apakah anda yakin ingin menyelesaikan Try Out ini?
        </p>
        <div className="my-3">
          <p className="text-gray-555 text-sm md:text-lg font-normal">
            Jawaban diisi: {marked}
          </p>
          <p className="text-gray-555 text-sm md:text-lg font-normal">
            Jawaban kosong: {unmarked}
          </p>
        </div>
        {marked === 0 && (
          <p className="text-rose-600 text-sm md:text-lg mt-3 font-semibold">
            Sorry cant allow you to omit for all questions.
          </p>
        )}
      </div>
      <div className="flex flex-1 w-full mt-4 px-10 pb-8">
        <div className="flex ml-auto">
          <Button onClick={handleConfirmSubmitModalClose}>Cancel</Button>
          <div className="ml-4">
            <Button
              variant="contained"
              color="primary"
              disabled={isQuizCorrectAnsLoading || marked === 0}
              onClick={handleSubmitAnswers}
            >
              {isLoading ? <CircularProgress size={24} /> : "Kirim"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
