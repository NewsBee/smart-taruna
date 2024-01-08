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

interface Props {
  id: string;
  title: string;
  correct: string;
  options: IOption[];
}

export const UpdateQuestionForm: React.FC<Props> = ({
  id,
  title,
  correct,
  options,
}) => {
  // const { quizId } = useParams() as {
  //   quizId: string;
  //   questionId: string;
  // };
  // const {
  //   mutate: updateQuestionMutate,
  //   reset: updateQuestionReset,
  //   isLoading,
  // } = useUpdateQuestion(quizId, id);

  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik<IQuestionForm>
      initialValues={{
        title: title || "",
        correct: correct || "",
        options: options || [
          { value: "" },
          { value: "" },
          { value: "" },
          { value: "" },
        ],
      }}
      validationSchema={AddEditQuestionValidation}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        console.log("Updating question with values:", values);
        // Logika untuk memproses data yang diperbarui
        // ...
        setSubmitting(false);
      }}
    >
      <AddEditQuestionFormFields isLoading={false} />
    </Formik>
  );
};
