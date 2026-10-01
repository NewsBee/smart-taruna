import { Button } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { IResponse } from "../shared/interfaces";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);
  const [marked, setMarked] = useState(0);
  const [unmarked, setUnmarked] = useState(0);
  // const [attemptId, setAttemptId] = useState(null);
  const router = useRouter()
  // console.log(responses)

  const handleSubmitAnswers = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");
    try {
      await axios.post('/api/ujian/submit', { attemptId, responses }, { timeout: 20000 });
      onConfirmSubmit?.();
      handleConfirmSubmitModalClose();
      router.push(`/hasil/${attemptId}`);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || "Jawaban belum berhasil dikumpulkan. Periksa koneksi lalu coba lagi.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
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
        Kumpulkan Jawaban
      </h4>
      <div className="my-4 mb-5 mx-5 md:mx-10">
        <p className="text-gray-555 text-sm md:text-lg font-medium">
          Apakah kamu yakin ingin mengumpulkan jawaban sekarang?
        </p>
        <div className="my-3">
          <p className="text-gray-555 text-sm md:text-lg font-normal">
            Soal terjawab: {marked}
          </p>
          <p className="text-gray-555 text-sm md:text-lg font-normal">
            Soal belum terjawab: {unmarked}
          </p>
        </div>
        {marked === 0 && (
          <p className="text-rose-600 text-sm md:text-lg mt-3 font-semibold">
            Jawaban belum bisa dikumpulkan jika semua soal masih kosong.
          </p>
        )}
      </div>
      {submitError && <p role="alert" className="mx-10 text-sm text-rose-700">{submitError}</p>}
      <div className="flex flex-1 w-full mt-4 px-10 pb-8">
        <div className="flex ml-auto">
          <Button disabled={submitting} onClick={handleConfirmSubmitModalClose}>Batal</Button>
          <div className="ml-4">
            <Button
              variant="contained"
              color="primary"
              disabled={submitting || isQuizCorrectAnsLoading || marked === 0}
              onClick={handleSubmitAnswers}
            >
              {submitting ? "Mengumpulkan..." : "Kumpulkan"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
