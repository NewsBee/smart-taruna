import { Card, CardContent, LinearProgress } from "@material-ui/core";
import { IOption } from "../shared/interfaces";
import CustomAccordion from "./CustomAccordion";
import { EmptyResponse } from "./EmptyResponse";
import { Option } from "./Option";
import { OptionHasil } from "./OptionHasil";
import { Paper, Typography, Box } from "@mui/material";

interface Props {
  responses: any;
  score: number;
  as: "AFTER_QUIZ_RESPONSE" | "AUTHOR_CHECK_RESPONSE" | "USER_CHECK_RESPONSE";
  quizDeleted?: boolean;
  ref?: string;
  tipe?: string;
}
// {AUTHOR_CHECK_RESPONSE ? "his" : "your"}

export const ShowResponses: React.FC<Props> = ({
  responses,
  score,
  as,
  quizDeleted,
  ref,
  tipe,
}) => {
  const AFTER_QUIZ_RESPONSE = as === "AFTER_QUIZ_RESPONSE";
  const AUTHOR_CHECK_RESPONSE = as === "AUTHOR_CHECK_RESPONSE";
  const isTPA = tipe === "TPA";
  // const USER_CHECK_RESPONSE = as === "USER_CHECK_RESPONSE";
  console.log(responses);
  // console.log(tipe);

  return (
    <>
      <div className="flex flex-col items-center mt-10 w-full">
        {AFTER_QUIZ_RESPONSE && (
          <div>
            <h1 className="text-xl md:text-3xl mb-5 text-center">
              Terimakasih sudah menyelesaikan Test
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center">
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

              {/* Accordion untuk TPA */}
              {isTPA && (
                <>
                  <div className="w-full mx-2 mb-4 md:mb-0">
                    <CustomAccordion
                      passingGrade={80}
                      tipeSoal="TPA"
                      responses={responses}
                    />
                  </div>
                  {/* <div className="w-full mx-2 mb-4 md:mb-0">
                    <CustomAccordion
                      passingGrade={80}
                      tipeSoal="TBI"
                      responses={responses}
                    />
                  </div> */}
                </>
              )}
            </div>
          </div>
        )}
        {quizDeleted && (
          <p className="text-xl mb-2 text-rose-600">Quiz ini sudah dihapus.</p>
        )}
        {/* <div className="mt-10">
          <div className="bg-blue-100 p-5 rounded-lg shadow-lg mx-5 md:mx-auto md:w-8/12">
            <p className="text-xl text-center text-blue-900 font-semibold">
              Nilai Anda adalah: {score}
            </p>
          </div>
        </div> */}
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
                    // value={(score / {tipe === "TPA" ? 500 : 550}) * 100}
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
              {/* Optional: Add more details or feedback based on the score */}
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

        <div className="mt-4 mx-5 /12 md:mx-0 md:w-8/12 ">
          <p className="mb-2 text-xl font-bold">Perhatian!</p>
          <br />
          <div className="grid-responses-options-show grid grid-cols-1 lg:grid-cols-3 gap-4">
            {responses.length > 0 && (
              <>
                <div>
                  <p>Jawaban Benar</p>
                  <OptionHasil
                    selectedOption={""} // Tidak ada jawaban yang dipilih
                    correctAns={"Opsi 1"}
                    option={{ value: "Opsi 1" }}
                    disabled
                  />
                </div>
                <div>
                  <p>Jawaban salah</p>
                  <OptionHasil
                    selectedOption={"Opsi 1"} // Pengguna memilih "Opsi 1"
                    correctAns={"Opsi 2"} // Jawaban yang benar adalah "Opsi 2"
                    option={{ value: "Opsi 1" }} // Tampilkan "Opsi 1" sebagai jawaban pengguna
                    disabled
                  />
                </div>
                <div>
                  <p>Anda memilih jawaban benar</p>
                  <OptionHasil
                    selectedOption={"Opsi 3"} // Pengguna memilih "Opsi 3"
                    correctAns={"Opsi 3"} // Jawaban yang benar adalah "Opsi 3"
                    option={{ value: "Opsi 3" }} // Tampilkan "Opsi 3" sebagai jawaban yang benar dan dipilih
                    disabled
                  />
                </div>
              </>
            )}
          </div>
          {responses.length > 0 ? (
            <div className="mt-10">
              <p className="mb-2 text-xl font-bold">Jawaban</p>
              {responses.map((resp: any, i: number) => (
                <div className="mb-20 shadow-sm" key={i}>
                  {resp.image && (
                    <div
                      style={{
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: "8px",
                        maxHeight: "300px",
                      }}
                    >
                      {" "}
                      {/* Set a maximum height */}
                      <img
                        src={resp.image}
                        alt="Gambar Soal"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}

                      />
                    </div>
                  )}
                  <p>
                    <span className="text-lg">{i + 1}.</span> {resp.title}
                  </p>
                  <div className="flex flex-col items-start">
                    {resp.options.map((option: IOption, i: number) => (
                      <OptionHasil
                        key={i}
                        selectedOption={resp.response}
                        correctAns={resp.correct}
                        option={option}
                        disabled
                        tipeSoal={tipe}
                      />
                    ))}
                  </div>
                  {(resp.quiz === "TKP" || resp.response !== resp.correct) && (
                    <div className="bg-emerald-500 p-4 mt-2 rounded-md">
                      <h2 className="text-white font-bold">Penjelasan</h2>
                      <p className="text-white">{resp.explanation}</p>
                    </div>
                  )}
                  {/* <div className="bg-emerald-500 p-4 mt-2 rounded-md">
                    <h2 className="text-white font-bold">Penjelasan</h2>
                    <p className="text-white">{resp.explanation}</p>
                  </div> */}
                </div>
              ))}
            </div>
          ) : (
            <>
              <EmptyResponse resource="Responses" />
            </>
          )}
        </div>
      </div>
    </>
  );
};
