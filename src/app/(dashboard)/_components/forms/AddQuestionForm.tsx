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
  AddEditQuestionValidation,
  AddEditQuestionValidationNew,
} from "../../shared/validationSchema";
import { AddEditQuestionFormFields } from "./AddEditQuestionFormFields";
import { useCreateQuestion } from "../../shared/queries";
import { useEffect } from "react";

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
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
          { value: "", poin: 0 },
        ],
        image:'',
        imageName:'',

      }}
      
      validationSchema={AddEditQuestionValidationNew}
      onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
        // console.log(values.image)
        const payload = {
          content: values.title,
          type: values.type,
          explanation: values.explanation,
          image: values.image,
          // packageId:  quizId,
          Choices: values.options.map((option) => ({
            content: option.value,
            isCorrect: values.correct === option.value,
            scoreValue:
              values.type !== "TKP" && values.correct === option.value
                ? 5
                : option.poin,
          })),
        };

        // console.log(payload);

        try {
          setSubmitting(true);
          if (!!!values.title.trim()) {
            setFieldError("title", "Only Spaces not allowed.");
            throw Error("Form Error");
          }

          values.options.forEach((option, index) => {
            if (!!!option.value.trim()) {
              setFieldError(
                `options.${index}.value`,
                "Only Spaces not allowed."
              );
              throw Error("Form Error");
            }
          });

          const maping: { [key: string]: number[] } = {};

          values.options.forEach((option1, i1) => {
            if (option1.value) {
              // Ensure option1.value is defined
              let flag = 0;
              const option1Indices: number[] = [];
              values.options.forEach((option2, i2) => {
                if (option1.value === option2.value) {
                  flag++;
                  option1Indices.push(i2);
                }
              });
              if (flag > 1) {
                maping[option1.value] = option1Indices;
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
