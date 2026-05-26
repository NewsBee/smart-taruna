"use client";

import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { Loader } from "../../../_components/Svgs";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { EmptyResponse } from "../../../_components/EmptyResponse";

interface AttemptData {
  score: number;
  responses: any[]; // Sesuaikan dengan struktur data yang sebenarnya
  Package: {
    testName: string;
    passingGrades: {
      type: string;
      minScore: number;
    }[];
  };
}

interface IChoice {
  content: string;
  isCorrect: boolean;
  scoreValue?: number;
}

export default function QuizResponse({ params }: { params: { id: any } }) {
  const attemptId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/hasil/${attemptId}`);
        // console.log(response)
        setAttemptData(response.data.attempt);
      } catch (err) {
        const error = err as AxiosError; // Menggunakan type assertion
        setError(
          error.response
            ? error.response.data
            : { message: "Something went wrong" }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, [attemptId]);
  // console.log(attemptData?.Package.testName)
  if (loading) {
    return <Loader halfScreen />;
  }

  if (error) {
    return <ErrorMessage message={error.message} statusCode={error.status} />;
  }

  if (!attemptData) {
    return <EmptyResponse resource="Responses" />;
  }

  const transformedResponses = attemptData.responses.map((resp) => ({
    _id: resp.Question.id.toString(),
    title: resp.Question.content,
    score: resp.score,
    image: resp.Question.image,
    quiz: resp.Question.type,
    answerType: resp.Question.answerType,
    response: resp.content,
    correct:
      resp.Question.correctAnswer ||
      resp.Question.Choices.find((choice: IChoice) => choice.isCorrect)
        ?.content,
    explanation: resp.Question.explanation,
    explanationImage: resp.Question.explanationImage,
    options: resp.Question.Choices.map((choice: IChoice) => ({
      value: choice.content,
      label: choice.content,
    })),
  }));

  // console.log(attemptData.score)
  return (
    <>
      {transformedResponses.length > 0 ? (
        <div className="">
          <div className=" ">
            {/* <DropdownButton/>
            <CustomAccordion/> */}
            <ShowResponses
              responses={transformedResponses}
              score={attemptData.score}
              as="AFTER_QUIZ_RESPONSE"
              tipe={attemptData.Package.testName}
              passingGrades={attemptData.Package.passingGrades}
            />
          </div>
          <div>

          </div>
        </div>
      ) : (
        <EmptyResponse resource="Responses" />
      )}
    </>
  );
}
