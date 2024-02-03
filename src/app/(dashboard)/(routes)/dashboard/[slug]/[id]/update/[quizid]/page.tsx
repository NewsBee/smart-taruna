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
  options: { _id: number; value: string, poin: number }[];
  type : string;
  explanation : string;
}

export default function UpdateQuestion({
  params,
}: {
  params: { quizid: string, id: number, slug:string };
}) {
  //   const { isLoading, data } = useQuizQuestion(quizId, questionId);
  // console.log(params.id)
  // console.log(params.slug)
  const { data, isLoading, isFetching, error } = useQuiz(
    parseInt(params.quizid)
  );
  const [questionData, setQuestionData] = useState<Update | null>(null);
  // console.log(data)
  // console.log(params.quizid)

  useEffect(() => {
    if (data) {
      const formattedData = {
        id: data.id.toString(),
        title: data.content,
        correct: data.Choices.find((choice: any) => choice.isCorrect).content,
        options: data.Choices.map((choice: any) => ({
          _id: choice.id,
          value: choice.content,
          poin : choice.scoreValue,
        })),
        type: data.type,
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
