import { Button } from "@material-ui/core";
import { AxiosError } from "axios";
import { Formik } from "formik";
import { useSnackbar } from "notistack";
import { UseMutateAsyncFunction, useQueryClient } from "react-query";
import { errorMessages, successMessages } from "../../shared/constants";
import { IQuizForm } from "../../shared/interfaces";
import { AddEditQuizValidation } from "../../shared/validationSchema";
import { AddEditQuizFormFields } from "../AddEditQuizFormFields";
import { useRouter } from "next/navigation";

interface Props {
  mutateAsync: UseMutateAsyncFunction<any, AxiosError<any, any>, any, unknown>;
  reset: () => void;
  title?: string;
  description?: string;
  tags?: string[];
  redirect: string;
  id?: string;
  status?: string;
  testname ?: string;
}

export const QuizForm: React.FC<Props> = ({
  mutateAsync,
  reset,
  description,
  tags,
  title,
  redirect,
  id,
  status,
  testname,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter()

  const queryClient = useQueryClient();

  return (
    <Formik<IQuizForm>
      initialValues={{
        title: title || "",
        description: description || "",
        tags: tags || [],
        status: status || "",
        duration: 0,
      }}
      validationSchema={AddEditQuizValidation}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        setSubmitting(true);
        // const body = { ...values };
        const body = {
          testName: testname, // Menggunakan testName dari props bertipe string
          title: values.title,
          description: values.description,
          tagNames : values.tags,
          duration: values.duration,
        };
        // console.log(values.duration)
        // if (!id) delete body.status;
        try {
          if (!!!values.title.trim()) {
            setFieldError("title", "Only Spaces not allowed.");
            throw Error("Form Error");
          }
          if (!!!values.description.trim()) {
            setFieldError("description", "Only Spaces not allowed.");
            throw Error("Form Error");
          }
          await mutateAsync(
            { body },
            {
              onSuccess: () => {
                queryClient.invalidateQueries("Quizes");
                enqueueSnackbar(
                  successMessages.actionSuccess(
                    id ? "Updated" : "Membuat",
                    "Paket"
                  )
                );
                id && queryClient.invalidateQueries(["Quiz", id]);
                router.push(redirect);
              },
              onError: () => {
                enqueueSnackbar(errorMessages.default);
              },
              onSettled: () => {
                reset();
                setSubmitting(false);
              },
            }
          );
        } catch (e) {
          console.log(e)
        }
      }}
    >
      {({ handleSubmit, isSubmitting }) => (
        <form className="pb-2" onSubmit={handleSubmit}>
          <div className="mx-10">
            <AddEditQuizFormFields id={id} />
            <div className="flex justify-end mt-4">
              <div className="mr-4">
                <Button onClick={() => router.push('/dashboard')}>Cancel</Button>
              </div>

              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                type="submit"
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};
