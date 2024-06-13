import { Box, Button, MenuItem, TextField } from "@material-ui/core";
import { FieldArray, useFormikContext } from "formik";
import { uiMessages } from "../../shared/constants";
import { IQuestionForm } from "../../shared/interfaces";
import { FormikError } from "../../shared/utils";
import { useRouter } from "next/navigation";
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
      if (response.data && response.data.path) {
        setFieldValue("image", response.data.path);
        setFieldValue("imageName", file.name);
        event.target.value = ""; // Reset the file input
      } else {
        alert("Gagal mengupload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file");
    }
  };

  const handleOptionFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    optionIndex: number
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
        `/api/pertanyaan/create/uploadimg/pilihan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.path) {
        const options = [...values.options];
        options[optionIndex].image = response.data.path;
        setFieldValue("options", options);
        event.target.value = ""; // Reset the file input
      } else {
        alert("Gagal mengupload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Gagal mengupload file");
    }
  };

  const openLightbox = () => {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      lightbox.classList.remove("hidden");
    }
  };

  const closeLightbox = () => {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      lightbox.classList.add("hidden");
    }
  };

  const handleRemoveImage = () => {
    if (confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      setFieldValue("image", "");
      setFieldValue("imageName", "");
    }
  };

  const handleRemoveOptionImage = (optionIndex: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      const options = [...values.options];
      options[optionIndex].image = "";
      setFieldValue("options", options);
    }
  };

  return (
    <form className="pb-2" onSubmit={handleSubmit}>
      <div className="mt-4">
        <Button
          variant="contained"
          component="label"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
            onBlur={handleBlur}
            name="image"
          />
        </Button>
        <br />
        {values.image && (
          <Box className="mt-5 relative inline-block">
            <img
              src={values.image}
              alt="Preview"
              className="max-w-xs cursor-pointer"
              onClick={openLightbox}
            />
            <button
              type="button"
              className="absolute top-0 right-0 text-white bg-red-500 hover:bg-red-700 rounded-full p-1 focus:outline-none"
              onClick={handleRemoveImage}
              style={{ transform: "translate(50%, -50%)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div
              id="lightbox"
              className="hidden fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
              onClick={closeLightbox}
            >
              <span
                className="absolute top-4 right-4 text-white text-4xl cursor-pointer"
                onClick={closeLightbox}
              >
                &times;
              </span>
              <div className="max-h-screen p-4">
                <img
                  src={values.image}
                  alt="Full size preview"
                  className="max-w-full h-auto max-h-[80vh] mx-auto"
                />
              </div>
            </div>
          </Box>
        )}
        {touched.image && errors.image && (
          <Box className="mt-1 text-sm text-red-500">{errors.image}</Box>
        )}
      </div>

      <div className="mt-4">
        <TextField
          multiline
          minRows={4}
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

      <div className="mt-4">
        <FieldArray name="options">
          {({ remove, push }) => (
            <>
              <div
                className="rounded-default mb-4 items-center"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 100px",
                  gap: "10px",
                }}
              >
                <p>Pilihan</p>
                <p className="justify-self-center">Gambar (Optional)</p>
                <p className="justify-self-center">Benar</p>
              </div>
              {values.options.length > 0 &&
                values.options.map((option, index) => (
                  <div
                    className="rounded-default mb-4 items-center"
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        values.type === "TKP"
                          ? "2fr 1fr 50px 50px"
                          : "2fr 1fr 50px",
                      gap: "10px",
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
                        !!FormikError(errors, touched, `options.${index}.value`)
                      }
                      helperText={FormikError(
                        errors,
                        touched,
                        `options.${index}.value`
                      )}
                    />
                    {!option.image ? (
                      <Button
                        variant="contained"
                        component="label"
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-2"
                      >
                        Upload Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleOptionFileChange(e, index)}
                          onBlur={handleBlur}
                          name={`options.${index}.image`}
                        />
                      </Button>
                    ) : (
                      <Box className="relative inline-block">
                        <img
                          src={option.image}
                          alt={`Preview Option ${index + 1}`}
                          className="max-w-xs max-h-32 cursor-pointer"
                          onClick={openLightbox}
                        />
                        <button
                          type="button"
                          className="absolute top-0 right-0 text-white bg-red-500 hover:bg-red-700 rounded-full p-1 focus:outline-none"
                          onClick={() => handleRemoveOptionImage(index)}
                          style={{ transform: "translate(50%, -50%)" }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                        <div
                          id="lightbox"
                          className="hidden fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
                          onClick={closeLightbox}
                        >
                          <span
                            className="absolute top-4 right-4 text-white text-4xl cursor-pointer"
                            onClick={closeLightbox}
                          >
                            &times;
                          </span>
                          <div className="max-h-screen p-4">
                            <img
                              src={option.image}
                              alt="Full size preview"
                              className="max-w-full h-auto max-h-[80vh] mx-auto"
                            />
                          </div>
                        </div>
                      </Box>
                    )}
                    {values.type === "TKP" ? (
                      <TextField
                        fullWidth
                        type="number"
                        name={`options.${index}.poin`}
                        value={option.poin}
                        onChange={(e) => {
                          const poinValue = parseInt(e.target.value, 10);
                          if (poinValue <= 5) {
                            handleChange(e);
                          } else {
                            alert("Poin harus kurang dari atau sama dengan 5");
                          }
                        }}
                        onBlur={handleBlur}
                        label="Poin"
                        variant="outlined"
                        InputProps={{ inputProps: { min: 1, max: 5 } }}
                      />
                    ) : (
                      <div className="grid items-center justify-center">
                        <div
                          onClick={() => {
                            if (values.type !== "TKP") {
                              setFieldValue("correct", values.options[index].value || values.options[index].image);
                            }
                          }}
                          className={`cursor-pointer flex items-center justify-center border-2 w-6 h-6 rounded-full ${
                            values.correct === option.value || values.correct === option.image
                              ? "border-indigo-600 bg-indigo-600"
                              : "border-gray-300"
                          }`}
                        >
                          {values.correct === option.value || values.correct === option.image && (
                            <div className="w-4 h-4 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </>
          )}
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
