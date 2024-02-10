"use client";

import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { Button } from "@material-ui/core";
import { useQuizQuestions } from "@/app/(dashboard)/shared/queries";
import { AddQuestionsSidebar } from "@/app/(dashboard)/_components/AddQuestionsSidebar";
import { AddQuestionForm } from "@/app/(dashboard)/_components/forms/AddQuestionForm";
import { IQuestion } from "@/app/(dashboard)/shared/interfaces";
import axios from "axios";
import { Loader } from "@/app/(dashboard)/_components/Svgs";
import { ErrorMessage } from "@/app/(dashboard)/_components/ErrorMessage";

interface Props {}

export default function AddQuestions({ params }: { params: { id: string, slug:string } }) {
  const id = parseInt(params.id);
  // console.log(params.slug)
  const totalSoal = params.slug === 'SKD' ? 110 : 100;
  //   const { isLoading, data } = useQuizQuestions(id);
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error } = useQuizQuestions(
    parseInt(params.id)
  );
  //   const [isLoading, setIsLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  useEffect(() => {
      if (data && data.questions) {
        // Mengubah data soal menjadi format yang dibutuhkan oleh state response
        const transformedQuestions = data.questions.map((q: any) => ({
          _id: q.id.toString(),
          title: q.content,
          quiz: data.testName, // Nama tes, misalnya 'SKD'
          options: q.choices.map((choice: any) => ({
            value: choice.content,
            label: choice.content,
          })),
        }));
      setQuestions(transformedQuestions);
    }
  }, [data]);
//   console.log(questions);

  const totalQuestions = questions.length;
  if (error) {
    return <ErrorMessage statusCode={404} message={"Error fetching data"} />;
  }

//   const refreshQuestions = () => {
//     queryClient.invalidateQueries(["Quiz Questions", id]);
//   };

  if (isLoading) {
    return <Loader halfScreen />;
  }

  return (
    <div
      style={{ height: "92vh" }}
      className="w-full flex flex-col flex-1 overflow-y-hidden"
    >
      <div className="min-h-[95%] border-t flex flex-row flex-1 overflow-y-auto">
        <AddQuestionsSidebar id={id} questions={questions} />
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-[8%] border-b border-gray-200 flex pl-4 pr-4 md:pr-10 py-4 justify-between">
            <p className="mt-auto">Add Question</p>
            <div className="flex flex-col justify-center items-center">
              <p className="mb-1">{totalQuestions} / {totalSoal} Added</p>
              <div className="bg-gray-200 rounded-full h-1 w-28 md:w-48">
                <div
                  className="bg-indigo-600 rounded-full h-1"
                  style={{ width: `${(totalQuestions / totalSoal) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="pl-4 pr-4 md:pr-10 mt-4">
            <AddQuestionForm quizId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
