import { IOption } from "../shared/interfaces";
import CustomAccordion from "./CustomAccordion";
import { EmptyResponse } from "./EmptyResponse";
import { Option } from "./Option";
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
  // console.log(responses);

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
                    <CustomAccordion tipeSoal="TIU" responses={responses} />
                  </div>
                  <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
                    <CustomAccordion tipeSoal="TWK" responses={responses} />
                  </div>
                  <div className="w-full md:w-1/3 mx-2 mb-4 md:mb-0">
                    <CustomAccordion tipeSoal="TKP" responses={responses} />
                  </div>
                </>
              )}

              {/* Accordion untuk TPA */}
              {isTPA && (
                <div className="w-full mx-2 mb-4 md:mb-0">
                  <CustomAccordion tipeSoal="TPA" responses={responses} />
                </div>
              )}
            </div>
          </div>
        )}
        {quizDeleted && (
          <p className="text-xl mb-2 text-rose-600">Quiz ini sudah dihapus.</p>
        )}
        <p className="text-xl">Nilai anda adalah: {score}</p>

        <div className="mt-4 mx-5 /12 md:mx-0 md:w-8/12 ">
          <p className="mb-2 text-xl font-bold">Perhatian!</p>
          <br />
          <div className="grid-responses-options-show grid grid-cols-1 lg:grid-cols-3 gap-4">
            {responses.length > 0 && (
              <>
                <div>
                  <p>Jawaban benar</p>
                  <Option
                    selectedOption={""}
                    correctAns={"Opsi 1"}
                    option={{ value: "Opsi 1" }}
                    disabled
                  />
                </div>
                <div>
                  <p>Jawaban Anda</p>
                  <Option
                    selectedOption={"Opsi 2"}
                    correctAns={"Opsi 2"}
                    option={{ value: "Opsi 2" }}
                    disabled
                  />
                </div>
                <div>
                  <p>Anda memilih jawaban benar</p>

                  <Option
                    selectedOption={"Opsi 3"}
                    correctAns={"Opsi 3"}
                    option={{ value: "Opsi 3" }}
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
                  <p>
                    {" "}
                    <span className="text-lg">{i + 1}.</span> {resp.title}
                  </p>
                  <div className="flex flex-col items-start">
                    {resp.options.map((option: IOption, i: number) => (
                      <Option
                        key={i}
                        selectedOption={resp.response}
                        correctAns={resp.correct}
                        option={option}
                        disabled
                      />
                    ))}
                  </div>
                  {resp.response !== resp.correct && (
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
