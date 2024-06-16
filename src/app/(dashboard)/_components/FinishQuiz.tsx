import React, { useEffect, useState } from "react";
import { Card, CardContent, LinearProgress } from "@material-ui/core";
import CustomAccordion from "./CustomAccordion";
import { EmptyResponse } from "./EmptyResponse";
import { OptionHasil } from "./OptionHasil";
import { Box, Typography } from "@mui/material";
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Props {
  responses: any;
  score: number;
  as: "AFTER_QUIZ_RESPONSE" | "AUTHOR_CHECK_RESPONSE" | "USER_CHECK_RESPONSE";
  quizDeleted?: boolean;
  ref?: string;
  tipe?: string;
  image?: string;
  packageId?: number;
}

interface IOption {
  id: string; // Ensure id is a string
  content: string;
  label?: string;
  value?: string;
  image?: string;
  percentage?: number;
  questionId: number;
}

interface IResponse {
  id: number;
  content: string;
  questionId: number;
  attemptId: number;
  score: number;
}

export const ShowResponses: React.FC<Props> = ({
  responses,
  score,
  as,
  quizDeleted,
  ref,
  tipe,
  image,
  packageId,
}) => {
  const [responseData, setResponseData] = useState<IResponse[]>([]);
  const [choicesData, setChoicesData] = useState<IOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/hasil/${packageId}/respon`);
        const data = await res.json();
        console.log("Fetched data:", data); // Log the fetched data
        setResponseData(data.responses);
        setChoicesData(data.choices.map((choice: any) => ({
          ...choice,
          id: String(choice.id) // Ensure id is a string
        })));
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [packageId]);

  console.log(responseData)
  console.log(choicesData)
  console.log(responses)

  const AFTER_QUIZ_RESPONSE = as === "AFTER_QUIZ_RESPONSE";
  const AUTHOR_CHECK_RESPONSE = as === "AUTHOR_CHECK_RESPONSE";
  const isTPA = tipe === "TPA";

  const openLightbox = (imageSrc: string) => {
    const lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.className =
      "fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center";
    lightbox.onclick = () => {
      document.body.removeChild(lightbox);
    };

    const closeBtn = document.createElement("span");
    closeBtn.className =
      "absolute top-4 right-4 text-white text-4xl cursor-pointer";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
      document.body.removeChild(lightbox);
    };

    const img = document.createElement("img");
    img.src = imageSrc;
    img.alt = "Full size preview";
    img.className = "max-w-full h-auto max-h-[80vh] mx-auto";

    lightbox.appendChild(closeBtn);
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
  };

  const calculatePercentages = (questionId: number) => {
    const questionResponses = responseData.filter(
      (response) => response.questionId === questionId
    );
    const totalResponses = questionResponses.length;
    const questionChoices = choicesData.filter(
      (choice) => (choice as any).questionId === questionId
    );
  
    console.log('questionResponses:', questionResponses);
    console.log('totalResponses:', totalResponses);
    console.log('questionChoices:', questionChoices);
  
    return questionChoices.map((choice) => {
      const matchCount = questionResponses.filter(
        (response) => response.content === String(choice.id)
      ).length;
  
      console.log(`Choice content: ${choice.content}, Match count: ${matchCount}`);
  
      return {
        ...choice,
        percentage: totalResponses ? (matchCount / totalResponses) * 100 : 0,
      };
    });
  };

  return (
    <>
      <div className="flex flex-col items-center mt-10 w-full">
        {AFTER_QUIZ_RESPONSE && (
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-4xl font-semibold">
              Terimakasih sudah menyelesaikan Test
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center mt-8">
              {!isTPA && (
                <>
                  <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
                    <CustomAccordion
                      passingGrade={80}
                      tipeSoal="TIU"
                      responses={responses}
                    />
                  </div>
                  <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
                    <CustomAccordion
                      passingGrade={65}
                      tipeSoal="TWK"
                      responses={responses}
                    />
                  </div>
                  <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
                    <CustomAccordion
                      passingGrade={166}
                      tipeSoal="TKP"
                      responses={responses}
                    />
                  </div>
                </>
              )}

              {isTPA && (
                <div className="w-full mx-2 mb-4 md:mb-0">
                  <CustomAccordion
                    passingGrade={80}
                    tipeSoal="TPA"
                    responses={responses}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {quizDeleted && (
          <p className="text-xl mb-2 text-rose-600">Quiz ini sudah dihapus.</p>
        )}

        <Box sx={{ maxWidth: 600, mt: 8, mx: "auto", textAlign: "center" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Nilai Anda
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                {score}/{tipe === "TPA" ? 500 : 550}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ width: "100%", mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(score / (tipe === "TPA" ? 500 : 550)) * 100}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                  >{`${Math.round(
                    (score / (tipe === "TPA" ? 500 : 550)) * 100
                  )}%`}</Typography>
                </Box>
              </Box>
              {score >= 380 ? (
                <Typography variant="body1" sx={{ color: "success.main" }}>
                  Selamat! Anda telah mencapai skor yang sangat baik.
                </Typography>
              ) : score >= 250 ? (
                <Typography variant="body1" sx={{ color: "warning.main" }}>
                  Bagus! Namun masih ada ruang untuk peningkatan.
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: "error.main" }}>
                  Tetap semangat! Perlu lebih banyak belajar lagi.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <div className="mt-10 mx-5 md:mx-auto md:w-10/12">
          <p className="text-xl font-bold mb-5">Keterangan Warna</p>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full mr-2"></div>
              <p>Hijau Terang: Jawaban Benar yang Dipilih</p>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-700 rounded-full mr-2"></div>
              <p>Hijau Gelap: Jawaban Benar</p>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-full mr-2"></div>
              <p>Merah: Jawaban Salah yang Dipilih</p>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
              <p>Abu-abu: Opsi yang Tidak Dipilih</p>
            </div>
            {/* <div className="flex items-center mb-2">
              <CheckCircleIcon className="text-green-500 mr-2" />
              <p>Ikon Hijau: Jawaban Benar yang Dipilih</p>
            </div>
            <div className="flex items-center mb-2">
              <LockClosedIcon className="text-red-500 mr-2" />
              <p>Ikon Merah: Jawaban Salah yang Dipilih</p>
            </div> */}
          </div>
        </div>

        <div className="mt-10 mx-5 md:mx-auto md:w-10/12">
          <p className="text-xl font-bold mb-5">Jawaban</p>
          {responses.length > 0 ? (
            responses.map((resp: any, i: number) => {
              console.log("Processing response:", resp);
              const optionsWithPercentages = calculatePercentages(parseInt(resp._id, 10));
              console.log("optionsWithPercentages:", optionsWithPercentages);
              return (
                <div
                  className="mb-8 shadow-lg rounded-lg overflow-hidden"
                  key={i}
                >
                  <div className="bg-white p-6">
                    <p className="whitespace-pre-wrap mb-4">
                      <span className="text-lg font-semibold">{i + 1}.</span>{" "}
                      {resp.title}
                    </p>
                    {resp.image && (
                      <div className="flex-shrink-0 mb-4 overflow-hidden rounded-lg mr-4">
                        <img
                          src={resp.image}
                          alt="Gambar Soal"
                          className="w-full max-w-xs h-auto object-contain cursor-pointer max-h-60"
                          onClick={() => openLightbox(resp.image)}
                        />
                        <p className="text-left text-xs text-gray-500 mt-2">
                          Klik gambar untuk memperbesar
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col items-start mb-4">
                      {loading ? (
                        <div className="w-full">
                          <Skeleton height={40} className="mb-4" />
                          <Skeleton height={40} className="mb-4" />
                          <Skeleton height={40} className="mb-4" />
                          <Skeleton height={40} className="mb-4" />
                        </div>
                      ) : (
                        resp.options &&
                        resp.options.map((option: IOption, index: number) => {
                          const optionWithPercentage =
                            optionsWithPercentages.find(
                              (o) => o.id.toString() === option.id.toString()
                            ) || option;

                          console.log(optionWithPercentage)

                          return (
                            <OptionHasil
                              key={index}
                              selectedOptionId={resp.response}
                              correctOptionId={resp.correct}
                              option={optionWithPercentage}
                              disabled
                              tipeSoal={tipe}
                            />
                          );
                        })
                      )}
                    </div>
                    {(resp.quiz === "TKP" || resp.response !== resp.correct) && (
                      <div className="bg-green-500 p-4 rounded-md">
                        <h2 className="text-white font-bold">Penjelasan</h2>
                        <p className="text-white">{resp.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyResponse resource="Responses" />
          )}
        </div>
      </div>
    </>
  );
};
