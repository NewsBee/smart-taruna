import { Box, Button, MenuItem, TextField } from "@material-ui/core";
import { FieldArray, useFormikContext } from "formik";
import { uiMessages } from "../../shared/constants";
import { IQuestionForm } from "../../shared/interfaces";
import { FormikError } from "../../shared/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

interface Props {
  isLoading: boolean;
  quizId?: number;
}

export const AddEditQuestionFormFields: React.FC<Props> = ({
  isLoading,
  quizId,
}) => {
  const [uploadingField, setUploadingField] = useState<
    "image" | "explanationImage" | null
  >(null);
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
  const clearUploadedImage = (target: "image" | "explanationImage") => {
    setFieldValue(target, "");
    setFieldValue(
      target === "image" ? "imageName" : "explanationImageName",
      ""
    );
  };

  const uploadQuestionImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    target: "image" | "explanationImage"
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("purpose", target === "explanationImage" ? "explanation" : "question");

    try {
      setUploadingField(target);
      const response = await axios.post(
        `/api/pertanyaan/create/uploadimg/${quizId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.path) {
        setFieldValue(target, response.data.path);
        setFieldValue(
          target === "image" ? "imageName" : "explanationImageName",
          file.name
        );
      } else {
        alert("Gagal mengupload file");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(error.response?.data?.message || "Gagal mengupload file");
    } finally {
      setUploadingField(null);
      event.target.value = "";
    }
  };

  // const selectedFileName = values.image ? values.image.name : "";

  return (
    <form className="pb-2" onSubmit={handleSubmit}>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Gambar Soal</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Opsional. Gunakan gambar yang membantu siswa memahami pertanyaan.
        </p>
        <Button
          variant="contained"
          component="label"
          className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={uploadingField === "image"}
        >
          {uploadingField === "image" ? "Mengunggah..." : "Unggah Gambar Soal"}
          <input
            type="file"
            hidden
            accept="image/*" // Accept only image files
            onChange={(event) => uploadQuestionImage(event, "image")}
            onBlur={handleBlur}
            name="image"
          />
        </Button>
        {values.imageName && (
          <Box className="mt-2 text-sm text-gray-600">{values.imageName}</Box>
        )}
        {values.image && (
          <div>
            <div className="mt-3 max-h-56 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={values.image}
                alt="Preview gambar soal"
                className="h-full max-h-56 w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => clearUploadedImage("image")}
              className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Hapus gambar soal
            </button>
          </div>
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
          select
          fullWidth
          name="answerType"
          value={values.answerType || "MULTIPLE_CHOICE"}
          onChange={handleChange}
          onBlur={handleBlur}
          error={!!(touched.answerType && errors.answerType)}
          helperText={touched.answerType && errors.answerType}
          label="Bentuk jawaban"
          variant="outlined"
        >
          <MenuItem value="MULTIPLE_CHOICE">Pilihan ganda</MenuItem>
          <MenuItem value="SCORED_CHOICE">Pilihan berskor / TKP</MenuItem>
          <MenuItem value="SHORT_TEXT">Jawaban teks singkat</MenuItem>
          <MenuItem value="NUMERIC">Jawaban angka</MenuItem>
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
          label="Pembahasan soal"
          variant="outlined"
        />
      </div>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Gambar Pembahasan</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Opsional. Cocok untuk pembahasan rumus, grafik, tabel, atau ilustrasi jawaban.
        </p>
        <Button
          variant="contained"
          component="label"
          className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={uploadingField === "explanationImage"}
        >
          {uploadingField === "explanationImage"
            ? "Mengunggah..."
            : "Unggah Gambar Pembahasan"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(event) => uploadQuestionImage(event, "explanationImage")}
            onBlur={handleBlur}
            name="explanationImage"
          />
        </Button>
        {values.explanationImageName && (
          <Box className="mt-2 text-sm text-gray-600">
            {values.explanationImageName}
          </Box>
        )}
        {values.explanationImage && (
          <div>
            <div className="mt-3 max-h-64 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={values.explanationImage}
                alt="Preview gambar pembahasan"
                className="h-full max-h-64 w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => clearUploadedImage("explanationImage")}
              className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Hapus gambar pembahasan
            </button>
          </div>
        )}
      </div>
      {(values.answerType === "SHORT_TEXT" || values.answerType === "NUMERIC") && (
        <>
          <div className="mt-4">
            <TextField
              fullWidth
              name="correctAnswer"
              value={values.correctAnswer || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!(touched.correctAnswer && errors.correctAnswer)}
              helperText={touched.correctAnswer && errors.correctAnswer}
              label="Kunci jawaban"
              variant="outlined"
            />
          </div>
          {values.answerType === "NUMERIC" && (
            <div className="mt-4">
              <TextField
                fullWidth
                type="number"
                name="tolerance"
                value={values.tolerance ?? 0}
                onChange={handleChange}
                onBlur={handleBlur}
                label="Toleransi jawaban angka"
                variant="outlined"
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              />
            </div>
          )}
        </>
      )}
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
      {values.answerType !== "SHORT_TEXT" && values.answerType !== "NUMERIC" && (
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
                      {(values.type === "TKP" || values.answerType === "SCORED_CHOICE") && (
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

                      {values.type !== "TKP" && values.answerType !== "SCORED_CHOICE" && (
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
                              values.answerType === "SCORED_CHOICE" ||
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
                            {(values.type === "TKP" || values.answerType === "SCORED_CHOICE") && (
                              <div className="w-4 h-4 rounded-full bg-white"></div>
                            )}
                            {values.type !== "TKP" &&
                              values.answerType !== "SCORED_CHOICE" &&
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
      )}
      <div className="mb-10">
        <div className="flex justify-end mt-4">
          <div className="mr-4">
            <Button onClick={() => router.push("/dashboard")}>Batal</Button>
          </div>

          <Button
            variant="contained"
            color="primary"
            disabled={isLoading}
            type="submit"
          >
            Simpan Soal
          </Button>
        </div>
      </div>
    </form>
  );
};
