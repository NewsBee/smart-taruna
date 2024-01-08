"use client";

import { UpdateQuestionForm } from "@/app/(dashboard)/_components/forms/UpdateQuestionForm";
import { IQuestion } from "@/app/(dashboard)/shared/interfaces";

interface Props {}

export default function UpdateQuestion({
  params,
}: {
  params: { quizid: string };
}) {
  //   const { isLoading, data } = useQuizQuestion(quizId, questionId);
  const dummyQuestionData = {
    id: "1",
    title: "Apa warna matahari",
    correct: "Ciptaan allah",
    options: [
      { _id: "1", value: "Ciptaan allah" },
      { _id: "2", value: "Kuning" },
      { _id: "3", value: "Merah" },
      { _id: "4", value: "Biru" }
    ]
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-10">
        Update Question
      </h3>
      <div className="mx-auto md:w-6/12">
        <UpdateQuestionForm {...dummyQuestionData} />
      </div>
    </div>
  );
}
