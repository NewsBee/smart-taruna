import { Formik } from "formik";
import { useSnackbar } from "notistack";
import { useQueryClient } from "react-query";
import {
  errorMessages,
  loadingMessages,
  successMessages,
} from "../../shared/constants";
import { IQuestionForm } from "../../shared/interfaces";
import { AddEditQuestionValidation, AddEditQuestionValidationNew } from "../../shared/validationSchema";
import { AddEditQuestionFormFields } from "./AddEditQuestionFormFields";
import { useUpdateQuestion } from "../../shared/queries";
import { useRouter } from "next/navigation";

export interface IOptions {
  value: string;
  _id?: number; // ubah dari string ke number
  poin?: number;
  image?: string;
}

interface Props {
  id: string;
  title: string;
  correct: string;
  options: IOptions[];
  type: string;
  explanation: string;
  slug: string;
  quizId: number;
  image: string;
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
  image,
}) => {
  const { mutate: updateQuestionMutate, isLoading, reset: updateQuestionReset } = useUpdateQuestion(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik<IQuestionForm>
      initialValues={{
        title: title || "",
        correct: correct || "",
        type: type,
        explanation: explanation,
        options: options.length > 0 ? options : [
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
        ],
        image: image || '',
        imageName: '',
      }}
      validationSchema={AddEditQuestionValidationNew}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        enqueueSnackbar(loadingMessages.actionLoading("Updating", "Question"), {
          variant: "info",
        });

        const payload = {
          content: values.title,
          type: values.type,
          explanation: values.explanation,
          image: values.image,
          Choices: values.options.map(option => ({
            id: option._id,
            content: option.value,
            isCorrect: values.correct === option.value || values.correct === option.image,
            scoreValue:
              values.type !== "TKP" && (values.correct === option.value || values.correct === option.image)
                ? 5
                : option.poin,
            image: option.image,
          })),
        };

        updateQuestionMutate(payload, {
          onSuccess: () => {
            enqueueSnackbar(
              successMessages.actionSuccess("Updated", "Question"),
              { variant: "success" }
            );
            router.push(`/dashboard/${slug}/${quizId}`);
            queryClient.invalidateQueries(["Quiz Questions", 'quiz']);
            queryClient.invalidateQueries(["Quiz Question"]);
          },
          onError: (error) => {
            enqueueSnackbar(errorMessages.default, { variant: "error" });
          },
          onSettled: () => {
            setSubmitting(false);
            updateQuestionReset();
          },
        });
      }}
    >
      <AddEditQuestionFormFields isLoading={isLoading} />
    </Formik>
  );
};
