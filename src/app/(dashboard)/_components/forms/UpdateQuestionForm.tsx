import { Formik } from "formik";
import { useSnackbar } from "notistack";
import { useQueryClient } from "react-query";
import {
  errorMessages,
  loadingMessages,
  successMessages,
} from "../../shared/constants";
import { IOption, IQuestionForm } from "../../shared/interfaces";
// import { useUpdateQuestion } from "../../shared/queries";
import { AddEditQuestionValidation } from "../../shared/validationSchema";
import { AddEditQuestionFormFields } from "./AddEditQuestionFormFields";
import { useUpdateQuestion } from "../../shared/queries";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  title: string;
  correct: string;
  options: IOptions[];
  type : string,
  explanation : string,
  slug : string;
  quizId : number;
}

export interface IOptions {
  value : string;
  _id?: number;
  poin ?: number;
}

export const UpdateQuestionForm: React.FC<Props> = ({
  id,
  title,
  correct,
  options,
  type,
  explanation,
  slug,
  quizId,
}) => {

  // console.log(slug)
  // console.log(quizId)

  const { mutate: updateQuestionMutate, isLoading, reset: updateQuestionReset } = useUpdateQuestion(id);
  const router = useRouter()

  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik<IQuestionForm>
      initialValues={{
        title: title || "",
        correct: correct || "",
        type: type,
        explanation: explanation,
        options: options.length > 0 ? options : [
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
        ],
      }}
      validationSchema={AddEditQuestionValidation}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        enqueueSnackbar(loadingMessages.actionLoading("Updating", "Question"), {
          variant: "info",
        });
        const payload = {
          content: values.title,
          type: values.type,
          explanation: values.explanation,
          Choices: values.options.map(option => ({
            id: option._id,
            content: option.value,
            isCorrect: values.correct === option.value,
            scoreValue: option.poin, 
          })),
        };
        console.log(payload)
        // console.log(id)
        
        updateQuestionMutate(payload, {
          onSuccess: () => {
            enqueueSnackbar(
              successMessages.actionSuccess("Updated", "Question"),
              { variant: "success" }
            );
            router.push(`/dashboard/${slug}/${quizId}`);
            queryClient.invalidateQueries(["Quiz Questions",'quiz']);
            queryClient.invalidateQueries(["Quiz Question"]);
          },
          onError: (error) => {
            // console.log(error)
            enqueueSnackbar(errorMessages.default, { variant: "error" });
          },
          onSettled: () => {
            setSubmitting(false);
            updateQuestionReset();
          },
        });
      }}
    >
      <AddEditQuestionFormFields isLoading={false} />
    </Formik>
  );
};
