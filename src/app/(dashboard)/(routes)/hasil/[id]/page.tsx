"use client";

import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../../../_components/ErrorMessage";
import { Loader } from "../../../_components/Svgs";
import { ShowResponses } from "../../../_components/FinishQuiz";
import { useRouter } from "next/navigation";
import { EmptyResponse } from "../../../_components/EmptyResponse";
import { getSession, useSession } from "next-auth/react";
import DropdownButton from "@/app/(dashboard)/_components/DropDownButton";
import CustomAccordion from "@/app/(dashboard)/_components/CustomAccordion";
import { Button, Typography } from "@mui/material";

interface AttemptData {
  score: number;
  packageId?: number;
  responses: any[];
  Package: {
    testName: string;
  };
  User: {
    id: number;
  };
}

interface IChoice {
  id: string;
  content: string;
  isCorrect: boolean;
  scoreValue?: number;
  image?: string;
}

export default function QuizResponse({ params }: { params: { id: any } }) {
  const attemptId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/hasil/${attemptId}`);
        setAttemptData(response.data.attempt);
      } catch (err) {
        const error = err as AxiosError;
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

  if (loading) {
    return <Loader halfScreen />;
  }

  if (error) {
    return <ErrorMessage message={error.message} statusCode={error.status} />;
  }

  const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

  // Ensure session is loaded before checking access
  if (status === "loading") {
    return <Loader halfScreen />;
  }

  if (!session || (session.user.role !== "admin" && userId !== attemptData?.User.id)) {
    return (
      <div className="access-denied">
        <Typography variant="h6">Akses Ditolak</Typography>
        <Typography variant="body2">Anda tidak memiliki akses untuk melihat halaman ini.</Typography>
        <Button variant="contained" color="primary" onClick={() => router.push("/")}>
          Kembali ke Beranda
        </Button>
      </div>
    );
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
    response: resp.content,
    correct: resp.Question.Choices.find((choice: IChoice) => choice.isCorrect)
      ?.id.toString(), // Change this to use the id instead of content
    explanation: resp.Question.explanation,
    options: resp.Question.Choices.map((choice: IChoice) => ({
      id: choice.id.toString(), // Ensure id is a string
      value: choice.content,
      label: choice.content,
      image: choice.image,
    })),
  }));

  return (
    <>
      {transformedResponses.length > 0 ? (
        <div className="">
          <div className="">
            <ShowResponses
              responses={transformedResponses}
              score={attemptData.score}
              as="AFTER_QUIZ_RESPONSE"
              tipe={attemptData.Package.testName}
              packageId={attemptData?.packageId}
            />
          </div>
        </div>
      ) : (
        <EmptyResponse resource="Responses" />
      )}
    </>
  );
}
