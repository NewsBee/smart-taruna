import { useState } from "react";
import { IQuiz } from "../shared/interfaces";
import { ModalSkeleton } from "./Modal";
import { QuizModalContents } from "./QuizModalContents";
import { usePathname, useRouter } from "next/navigation";

interface Props extends IQuiz {
  onSelect?: () => void;
  score?: number;
  deleted?: boolean;
  redirect?: string;
  selected?: boolean;
  className?: string;
}

export const TestCard: React.FC<Props> = (props) => {
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
    className,
  } = props;
  // const isDashboardPage = useMatch("/dashboard");
  // const navigate = useNavigate();
  let tags = ["SKD", "TPA"]; // Default tags
  if (title.toLowerCase() === "skd") {
    tags = ["TIU", "TWK", "TKP"];
  } else if (title.toLowerCase() === "tpa") {
    tags = ["Test Potensi Akademik", "TBI"];
  }

  const [quizModalActive, setQuizModalActive] = useState(false);
  const handleQuizModalActive = () => setQuizModalActive(true);
  const handleQuizModalClose = () => {
    setQuizModalActive((p) => !p);
  };

  return (
    <>
      <div
        onClick={
          () =>
            onSelect
              ? onSelect()
              : redirect
              ? router.push(`${redirect}`)
              : handleQuizModalActive()
          // : navigate(`/quizes/${_id}`)
        }
        className={`w-full relative shadow-md px-10 py-8 rounded-md bg-white cursor-pointer ${className} ${
          selected ? " border-2 border-teal-500" : ""
        }` }
        style={{ boxShadow: "15px 15px 54px -10px #0000001f" }}
      >
        {pathname == "/dashboard" && (
          <p
            className={`${
              status === "aktif"
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
        />
      </ModalSkeleton>
    </>
  );
};
