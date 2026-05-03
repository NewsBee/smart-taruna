import { Button } from "@mui/material";
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
  const normalizedTestName = String(testname || "").toUpperCase();
  const defaultPassingGrades =
    normalizedTestName === "SKD"
      ? { TWK: 65, TIU: 80, TKP: 166 }
      : { TWK: 0, TIU: 0, TKP: 0 };

  return (
    <Formik<IQuizForm>
      initialValues={{
        title: title || "",
        description: description || "",
        tags: tags || (testname ? [testname.toUpperCase()] : []),
        status: status || "",
        duration: 120,
        maxAttempts: 1,
        passingGrades: defaultPassingGrades,
        examToken: "",
        tryoutOrder: "",
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
          maxAttempts: values.maxAttempts,
          passingGrades: values.passingGrades,
          examToken: values.examToken,
          tryoutOrder: values.tryoutOrder,
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
              onError: (error: AxiosError<any>) => {
                enqueueSnackbar(error.response?.data?.message || errorMessages.default, {
                  variant: "error",
                });
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
          <div>
            <AddEditQuizFormFields id={id} />
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Button
                variant="outlined"
                onClick={() => router.push(redirect)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Menyimpan..." : id ? "Simpan Perubahan" : "Buat Paket"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};
