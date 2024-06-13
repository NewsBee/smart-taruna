import axios from "axios";
import { Formik } from "formik";
import { useSnackbar } from "notistack";
import { useQueryClient } from "react-query";
import {
  errorMessages,
  loadingMessages,
  successMessages,
} from "../../shared/constants";
import { IQuestionForm } from "../../shared/interfaces";
import {
  AddEditQuestionValidationNew,
} from "../../shared/validationSchema";
import { AddEditQuestionFormFields } from "./AddEditQuestionFormFields";
import { useCreateQuestion } from "../../shared/queries";

interface Props {
  quizId: number;
}

export const AddQuestionForm: React.FC<Props> = ({ quizId }) => {
  const { enqueueSnackbar } = useSnackbar();
  if (!quizId) {
    enqueueSnackbar(errorMessages.default, { variant: "error" });
  }
  const {
    mutate: createQuestionMutate,
    reset: createQuestionReset,
    isLoading,
  } = useCreateQuestion(quizId);

  const queryClient = useQueryClient();

  return (
    <Formik<IQuestionForm>
      initialValues={{
        title: "",
        correct: "",
        type: "",
        explanation: "",
        options: [
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
          { value: "", poin: 0, image: "" },
        ],
        image: "",
        imageName: "",
      }}
      validationSchema={AddEditQuestionValidationNew}
      onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
        const payload = {
          content: values.title,
          type: values.type,
          explanation: values.explanation,
          image: values.image,
          Choices: values.options.map((option) => ({
            content: option.value,
            isCorrect: values.correct === option.value || values.correct === option.image,
            scoreValue:
              values.type !== "TKP" && (values.correct === option.value || values.correct === option.image)
                ? 5
                : option.poin,
            image: option.image,
          })),
        };

        try {
          setSubmitting(true);
          if (!!!values.title.trim()) {
            setFieldError("title", "Only Spaces not allowed.");
            throw Error("Form Error");
          }

          values.options.forEach((option, index) => {
            if (!option.value.trim() && !option.image) {
              setFieldError(
                `options.${index}.value`,
                "Value or Image is required."
              );
              throw Error("Form Error");
            }
          });

          const maping: { [key: string]: number[] } = {};

          values.options.forEach((option1, i1) => {
            if (option1.value || option1.image) {
              let flag = 0;
              const option1Indices: number[] = [];
              values.options.forEach((option2, i2) => {
                if ((option1.value && option1.value === option2.value) || (option1.image && option1.image === option2.image)) {
                  flag++;
                  option1Indices.push(i2);
                }
              });
              if (flag > 1) {
                maping[option1.value || option1.image || ""] = option1Indices;
              }
            }
          });

          const errors = Object.entries(maping);

          errors.forEach((element) => {
            element[1].forEach((index) =>
              setFieldError(
                `options.${index}.value`,
                "Duplicate option are not allowed."
              )
            );
          });

          if (errors.length) throw Error("DUPLICATE_OPTION");
          enqueueSnackbar(
            loadingMessages.actionLoading("Creating", "Question"),
            {
              variant: "info",
            }
          );

          createQuestionMutate(payload, {
            onSuccess: () => {
              queryClient.invalidateQueries(["quizQuestions", quizId]);
              enqueueSnackbar(
                successMessages.actionSuccess("Membuat", "Question"),
                { variant: "success" }
              );
              resetForm();
            },
            onError: (err: any) => {
              console.log(err);
              if (axios.isAxiosError(err)) {
                enqueueSnackbar(err.response?.data.message, {
                  variant: "error",
                });
              } else {
                enqueueSnackbar(errorMessages.default, { variant: "error" });
              }
            },
            onSettled: () => {
              createQuestionReset();
            },
          });
        } catch (e) {
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <AddEditQuestionFormFields quizId={quizId} isLoading={isLoading} />
    </Formik>
  );
};