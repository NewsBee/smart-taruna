import { useState } from "react";
import { IQuiz } from "../shared/interfaces";
import { ModalSkeleton } from "./Modal";
import { QuizModalContents } from "./QuizModalContents";
import { usePathname, useRouter } from "next/navigation";
import LockIcon from "@mui/icons-material/Lock";

interface Props extends IQuiz {
  onSelect?: () => void;
  score?: number;
  deleted?: boolean;
  redirect?: string;
  selected?: boolean;
  currTest?: string;
  duration?: number;
  disabled?: boolean;
}

export const QuizCard: React.FC<Props> = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    id,
    title,
    description = "No description available.", // Default value if not provided
    onSelect,
    status,
    score,
    redirect,
    selected,
    attemptsCount,
    questionsCount,
    currTest = "",
    duration,
    disabled,
  } = props;
  // const isDashboardPage = useMatch("/dashboard");
  // const navigate = useNavigate();
  let tags = ["SKD", "TPA"]; // Default tags
  if (currTest.toLowerCase() === "skd") {
    tags = ["SKD"];
  } else if (currTest.toLowerCase() === "tpa") {
    tags = ["TPA"];
  }

  const [quizModalActive, setQuizModalActive] = useState(false);
  const handleQuizModalActive = () => setQuizModalActive(true);
  const handleQuizModalClose = () => {
    setQuizModalActive((p) => !p);
  };

  // console.log(disabled)

  return (
    <>
      <div
        onClick={() => {
          if (!disabled) {
            // Hanya menjalankan jika tidak disabled
            if (onSelect) {
              onSelect();
            } else if (redirect) {
              router.push(redirect);
            } else {
              handleQuizModalActive();
            }
          }
        }}
        className={`relative shadow-md px-10 py-8 rounded-md bg-[white] cursor-pointer ${
          selected ? " border-2 border-teal-500" : ""
        } ${pathname === '/ujian/'+ currTest ? "border-2 border-teal-500" : ""}`}
        style={{ boxShadow: "15px 15px 54px -10px #0000001f" }}
      >
        {pathname == "/dashboard" && (
          <p
            className={`${
              status === "active"
                ? "bg-teal-500"
                : status === "draft"
                ? "bg-yellow-500"
                : status === "inactive"
                ? "bg-rose-600"
                : ""
            } text-white font-normal capitalize absolute rounded-md px-3 py-0.5 right-5 top-5 text-xs`}
          >
            {status}
          </p>
        )}
        <p className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis	break-words mt-2">
          {title}
        </p>
        <p className="mt-4 break-words">
          {description.length > 200
            ? description.slice(0, 200) + "..."
            : description}
        </p>
        {(score === 0 || score) && (
          <p className="absolute px-3 py-0.5 bottom-5 right-5 text-xs rounded-md font-medium text-white bg-emerald-500">
            Score : {score}
          </p>
        )}
        <div className="flex mt-4">
          {tags.map((tag, i) => (
            <p
              key={i}
              style={{
                boxShadow: "0 5px 10px rgba(0,0,0,0.07)",
                fontSize: "11px",
                letterSpacing: "0.1px",
                maxWidth: 100,
              }}
              className="mr-5 text-xs py-0.5 px-2 bg-slate-300 rounded font-medium text-gray-700 break-words overflow-hidden whitespace-nowrap text-ellipsis"
            >
              {tag}
            </p>
          ))}
        </div>
        {disabled && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 hover:bg-opacity-90">
            <div className="text-gray-500 hover:text-gray-700">
              <LockIcon className="text-8xl" />
            </div>
          </div>
        )}
      </div>
      <ModalSkeleton open={quizModalActive} onClose={handleQuizModalClose}>
        <QuizModalContents
          onClose={handleQuizModalClose}
          _id={id}
          title={title}
          description={description}
          tags={tags}
          status={status}
          score={score}
          currTest={currTest}
          attemptsCount={attemptsCount}
          questionsCount={questionsCount}
          duration={duration}
        />
      </ModalSkeleton>
    </>
  );
};
