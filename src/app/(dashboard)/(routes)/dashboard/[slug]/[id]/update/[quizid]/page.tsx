"use client";

import { UpdateQuestionForm } from "@/app/(dashboard)/_components/forms/UpdateQuestionForm";
import { IQuestion } from "@/app/(dashboard)/shared/interfaces";
import { useQuiz } from "@/app/(dashboard)/shared/queries";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

interface Props {}

interface Update {
  id: string;
  title: string;
  correct: string;
  options: { _id: number; value: string, poin: number, image: string }[];
  type: string;
  explanation: string;
  image: string;
}

export default function UpdateQuestion({
  params,
}: {
  params: { quizid: string, id: number, slug:string };
}) {
  const { data, isLoading, isFetching, error } = useQuiz(
    parseInt(params.quizid)
  );
  const [questionData, setQuestionData] = useState<Update | null>(null);

  useEffect(() => {
    if (data) {
      // Temukan pilihan yang benar berdasarkan content atau image
      const correctChoice = data.Choices.find((choice: any) => choice.isCorrect);
      // Tentukan correct berdasarkan content atau image
      const correct = correctChoice ? (correctChoice.content || correctChoice.image) : "";

      const formattedData = {
        id: data.id.toString(),
        title: data.content,
        correct: correct,
        options: data.Choices.map((choice: any) => ({
          _id: choice.id,
          value: choice.content,
          poin: choice.scoreValue,
          image: choice.image || "",
        })),
        type: data.type,
        image: data.image || "",
        explanation: data.explanation,
      };
      setQuestionData(formattedData);
    }
  }, [data, params.quizid]);

  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-10">
        Update Pertanyaan
      </h3>
      <div className="mx-auto md:w-6/12">
        {!questionData ? (
          <CircularProgress />
        ) : (
          <>
            <UpdateQuestionForm slug={params.slug} quizId={params.id} {...questionData} />
          </>
        )}
      </div>
    </div>
  );
}
