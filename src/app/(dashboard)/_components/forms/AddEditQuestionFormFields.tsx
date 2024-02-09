import { Box, Button, MenuItem, TextField } from "@material-ui/core";
import { FieldArray, useFormikContext } from "formik";
import { uiMessages } from "../../shared/constants";
import { IQuestionForm } from "../../shared/interfaces";
import { FormikError } from "../../shared/utils";
import { useRouter } from "next/navigation";
import { StyledButton } from "@/components/styled-button";
import { warn } from "console";
import axios from "axios";

interface Props {
  isLoading: boolean;
  quizId?: number;
}

export const AddEditQuestionFormFields: React.FC<Props> = ({
  isLoading,
  quizId,
}) => {
  const {
    touched,
    errors,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormikContext<IQuestionForm>();
  // console.log(quizId)
  const router = useRouter();
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      confirm("Ukuran file terlalu besar");
      return;
    }

    const formData = new FormData();

    formData.append("image", file);

    try {
      const response = await axios.post(
        `/api/pertanyaan/create/uploadimg/${quizId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log(response.data)
      // Jika upload berhasil, simpan URL file yang dikembalikan API ke dalam form
      if (response.data && response.data.path) {
        // Menggunakan setFieldValue dari useFormikContext untuk mengatur nilai field
        setFieldValue("image", response.data.path); // Mengatur URL gambar yang diupload
        setFieldValue("imageName", file.name); // Menyimpan nama file yang diupload
      } else {
        alert("Gagal mengupload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file");
    }
  };

  // const selectedFileName = values.image ? values.image.name : "";

  return (
    <form className="pb-2" onSubmit={handleSubmit}>
      <div className="mt-4">
        <Button
          variant="contained"
          component="label"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*" // Accept only image files
            onChange={handleFileChange}
            onBlur={handleBlur}
            name="image"
          />
        </Button>
        {values.imageName && (
          <Box className="mt-2 text-sm text-gray-600">{values.imageName}</Box>
        )}
        {touched.image && errors.image && (
          <Box className="mt-1 text-sm text-red-500">{errors.image}</Box>
        )}
      </div>

      <div className="mt-4">
        <TextField
          fullWidth
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.title && errors.title)}
          helperText={touched.title && errors.title}
          id="title"
          label="Pertanyaan"
          variant="outlined"
        />
      </div>
      <div className="mt-4">
        <TextField
          select
          fullWidth
          name="type"
          value={values.type}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.type && errors.type)}
          helperText={touched.type && errors.type}
          label="Tipe soal"
          variant="outlined"
        >
          <MenuItem value="TIU">TIU</MenuItem>
          <MenuItem value="TWK">TWK</MenuItem>
          <MenuItem value="TKP">TKP</MenuItem>
          <MenuItem value="TPA">TPA</MenuItem>
          {/* <MenuItem value="TBI">TBI</MenuItem> */}
        </TextField>
      </div>

      <div className="mt-4">
        <TextField
          fullWidth
          value={values.explanation}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.explanation && errors.explanation)}
          helperText={touched.explanation && errors.explanation}
          id="explanation"
          label="Pemabahasan soal"
          variant="outlined"
        />
      </div>
      {/* Field untuk 'poin' */}
      {/* {values.type === "TPA" && (
        <div className="mt-4">
          <TextField
            fullWidth
            type="number"
            name="poin"
            value={values.poin}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!(touched.poin && errors.poin)}
            helperText={touched.poin && errors.poin}
            label="Poin"
            variant="outlined"
          />
        </div>
      )} */}
      <div className="mt-4">
        <FieldArray name="options">
          {({ remove, push }) => {
            return (
              <>
                <div
                  className="rounded-default mb-4 items-center"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px",
                  }}
                >
                  <p>Pilihan</p>
                  <p className="justify-self-center">Benar</p>
                </div>
                {values.options.length > 0 &&
                  values.options.map((option, index) => (
                    <div
                      className="rounded-default mb-4 items-center"
                      key={index}
                      style={{
                        display: "grid",
                        // gridTemplateColumns: "1fr 100px",
                        gridTemplateColumns:
                          values.type === "TKP" ? "1fr 50px 50px" : "1fr 50px",
                      }}
                    >
                      <TextField
                        fullWidth
                        value={values.options[index].value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        id={`options.${index}.value`}
                        label={`Opsi ${index + 1}`}
                        variant="outlined"
                        error={
                          !!FormikError(
                            errors,
                            touched,
                            `options.${index}.value`
                          )
                        }
                        helperText={FormikError(
                          errors,
                          touched,
                          `options.${index}.value`
                        )}
                      />
                      {values.type === "TKP" && (
                        <TextField
                          fullWidth
                          type="number"
                          name={`options.${index}.poin`}
                          value={option.poin}
                          onChange={(e) => {
                            const poinValue = parseInt(e.target.value, 10);
                            // Periksa apakah poinValue kurang dari atau sama dengan 5
                            if (poinValue <= 5) {
                              handleChange(e);
                            } else {
                              // Opsi: tampilkan pesan error atau set nilai maksimal menjadi 5
                              // contoh: setFieldValue(`options.${index}.poin`, 5);
                              // atau tampilkan pesan kesalahan
                              alert(
                                "Poin harus kurang dari atau sama dengan 5"
                              );
                            }
                          }}
                          // onChange={handleChange}
                          onBlur={handleBlur}
                          label="Poin"
                          variant="outlined"
                          InputProps={{ inputProps: { min: 1, max: 5 } }}
                        />
                      )}

                      {values.type !== "TKP" && (
                        <div className="grid items-center justify-center">
                          <div
                            onClick={() => {
                              if (values.type !== "TKP") {
                                setFieldValue(
                                  "correct",
                                  values.options[index].value
                                );

                                // Check if the answer is correct
                                const isCorrect =
                                  values.options[index].value ===
                                  values.correct;

                                // Set poin to 5 if it's correct and not TPA
                                setFieldValue(
                                  `options.${index}.poin`,
                                  isCorrect ? 5 : 0
                                );
                              }
                            }}
                            className={`cursor-pointer flex items-center justify-center border-2 w-6 h-6 rounded-full ${
                              values.type === "TKP" ||
                              values.correct === option.value
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-300"
                            }`}
                          >
                            {/* {!values.options.find((val) => val.value === "") &&
                            values.correct === option.value && (
                              <div className="bg-indigo-600 w-4 h-4 rounded-full">
                                &nbsp;
                              </div>
                            )} */}
                            {values.type === "TKP" && (
                              <div className="w-4 h-4 rounded-full bg-white"></div>
                            )}
                            {values.type !== "TKP" &&
                              values.correct === option.value && (
                                <div className="w-4 h-4 rounded-full bg-white"></div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </>
            );
          }}
        </FieldArray>
        <p className="text-sm font-thin text-rose-600 text-right">
          {touched.correct && errors.correct}
        </p>

        {uiMessages.allowedMarkingACorrectOption.map((message, index) => (
          <p key={index} className="text-sm font-thin w-full md:w-10/12">
            {message}
          </p>
        ))}
        <div className="mt-4">
          {uiMessages.warnQuestionCreate.map((message, index) => (
            <p key={index} className="text-sm font-thin w-full md:w-10/12">
              {message}
            </p>
          ))}
        </div>
      </div>
      <div className="mb-10">
        <div className="flex justify-end mt-4">
          <div className="mr-4">
            <Button onClick={() => router.push("/dashboard")}>Cancel</Button>
          </div>

          <Button
            variant="contained"
            color="primary"
            disabled={isLoading}
            type="submit"
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
};
