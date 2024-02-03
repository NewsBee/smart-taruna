import { useSnackbar } from "notistack";
import { useState } from "react";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import { useQueryClient } from "react-query";
import {
  errorMessages,
  loadingMessages,
  successMessages,
} from "../shared/constants";
import { IQuestion } from "../shared/interfaces";
import { DeleteModal } from "./DeleteModal";
import { useRouter } from "next/navigation";
import { useDeleteQuestion } from "../shared/queries";

interface SidebarProps {
  index: number;
  expanded: boolean;
  showQuestions: boolean;
  question: IQuestion;
  expandQuestion: string;
  setExpandQuestion: React.Dispatch<React.SetStateAction<string>>;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  id?: number;
}

export const SidebarQuestion: React.FC<SidebarProps> = ({
  index,
  expanded,
  showQuestions,
  question,
  setExpandQuestion,
  expandQuestion,
  setExpanded,
  id,
}) => {
  if (typeof id === 'undefined') {
    throw new Error("id is undefined");
  }

  const { mutate, reset, isLoading } = useDeleteQuestion(id)
  const queryClient = useQueryClient();
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar();

  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalActive(true);
  const handleDeleteModalClose = () => setDeleteModalActive(false);
  // console.log(id)

  
  const onDeleteQuestion = () => {
    if (typeof id === 'undefined') {
      console.error("id is undefined, cannot delete question");
      return;
    }
    enqueueSnackbar(loadingMessages.actionLoading("Deleting", "Question"), {
      variant: "info",
    });
    mutate(
      { id: parseInt(question._id) },
      {
        onError: () => {
          enqueueSnackbar(errorMessages.default, { variant: "error" });
        },
        onSuccess: () => {
          queryClient.invalidateQueries(["Quiz Questions", id]);
          enqueueSnackbar(
            successMessages.actionSuccess("Deleted", "Question"),
            { variant: "success" }
          );
          handleDeleteModalClose();
        },
      }
    );
  };

  // const onDeleteQuestion = async () => {
  //   enqueueSnackbar(loadingMessages.actionLoading("Deleting", "Question"), {
  //     variant: "info",
  //   });
  //   mutate(
  //     { 'id': parseInt(question._id) },
  //     {
  //       onError: () => {
  //         enqueueSnackbar(errorMessages.default, { variant: "error" });
  //       },
  //       onSettled: () => {
  //         reset();
  //         handleDeleteModalClose();
  //       },
  //       onSuccess: () => {
  //         // queryClient.invalidateQueries(["Quiz Questions", question._id]);
  //         enqueueSnackbar(
  //           successMessages.actionSuccess("Deleted", "Question"),
  //           { variant: "success" }
  //         );
  //       },
  //     }
  //   );
  // };

  return (
    <div
      className={`rounded-md px-2 py-3${
        expanded && expandQuestion === question._id ? " bg-gray-100" : ""
      } mb-4`}
    >
      <div
        onClick={() => {
          setExpanded(true);
          setExpandQuestion(question._id);
        }}
        className={`transition-all duration-300 cursor-pointer flex`}
      >
        <p
          className={`w-8 h-8 bg-gray-400 text-white text-sm rounded-full flex items-center justify-center`}
        >
          {index + 1}
        </p>

        {expanded && showQuestions && (
          <p className="pl-4 w-10/12">
            {question.title.length > 60
              ? question.title.slice(0, 60) + "..."
              : question.title}
          </p>
        )}
      </div>
      {expanded && (
        <div
          className="transition-all duration-800 overflow-hidden flex"
          style={{ maxHeight: expandQuestion === question._id ? "60px" : 0 }}
        >
          <div className="flex ml-auto">
            <div
              onClick={handleDeleteModalOpen}
              className="p-2 bg-indigo-600 rounded-full mr-4 cursor-pointer"
            >
              <AiFillDelete fill="#fff" size={16} />
            </div>
            <DeleteModal
              resource="Question"
              modalTitle="Delete Question"
              onDelete={onDeleteQuestion}
              deleteLoading={isLoading}
              deleteModalActive={deleteModalActive}
              handleDeleteModalClose={handleDeleteModalClose}
            />
            <div
              onClick={() =>
                router.push(`/dashboard/SKD/${id}/update/${question._id}`)
              }
              className="p-2 bg-indigo-600 rounded-full mr-4 cursor-pointer"
            >
              <AiFillEdit fill="#fff" size={16} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
