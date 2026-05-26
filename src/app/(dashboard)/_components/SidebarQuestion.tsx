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
  testname : string;
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
  testname,
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
      className={`mb-3 rounded-xl border transition ${
        expanded && expandQuestion === question._id
          ? "border-indigo-200 bg-white shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        onClick={() => {
          setExpanded(true);
          setExpandQuestion(question._id);
        }}
        className="flex cursor-pointer gap-3 p-3 transition-all duration-300"
      >
        <p
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            expanded && expandQuestion === question._id
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {index + 1}
        </p>

        {expanded && showQuestions && (
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">
              {question.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                {question.quiz}
              </span>
              <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                {question.options.length} opsi
              </span>
            </div>
          </div>
        )}
      </div>
      {expanded && (
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: expandQuestion === question._id ? "72px" : 0 }}
        >
          <div className="flex justify-end gap-2 border-t border-slate-100 px-3 py-3">
            <button
              type="button"
              onClick={handleDeleteModalOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 transition hover:bg-rose-100"
              title="Hapus soal"
            >
              <AiFillDelete size={16} />
            </button>
            <DeleteModal
              resource="Soal"
              modalTitle="Hapus Soal"
              onDelete={onDeleteQuestion}
              deleteLoading={isLoading}
              deleteModalActive={deleteModalActive}
              handleDeleteModalClose={handleDeleteModalClose}
            />
            <button
              type="button"
              onClick={() =>
                router.push(`/dashboard/${testname}/${id}/update/${question._id}`)
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 transition hover:bg-indigo-100"
              title="Edit soal"
            >
              <AiFillEdit size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
