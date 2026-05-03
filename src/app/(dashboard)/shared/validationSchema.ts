import * as Yup from 'yup';

export const AddEditQuizValidation = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    description: Yup.string().required('Description is required.'),
    tags: Yup.array().of(Yup.string()).min(1, 'At least one tag is required'),
    duration: Yup.number()
        .typeError('Duration must be a number')
        .positive('Duration must be positive')
      .required('Duration is required'),
    maxAttempts: Yup.number()
      .typeError('Batas percobaan harus berupa angka')
      .integer('Batas percobaan harus bilangan bulat')
      .min(1, 'Batas percobaan minimal 1 kali')
      .max(20, 'Batas percobaan maksimal 20 kali')
      .required('Batas percobaan wajib diisi'),
    passingGrades: Yup.object().shape({
      TWK: Yup.number()
        .typeError('Passing grade TWK harus berupa angka')
        .integer('Passing grade TWK harus bilangan bulat')
        .min(0, 'Passing grade TWK minimal 0')
        .max(999, 'Passing grade TWK maksimal 999'),
      TIU: Yup.number()
        .typeError('Passing grade TIU harus berupa angka')
        .integer('Passing grade TIU harus bilangan bulat')
        .min(0, 'Passing grade TIU minimal 0')
        .max(999, 'Passing grade TIU maksimal 999'),
      TKP: Yup.number()
        .typeError('Passing grade TKP harus berupa angka')
        .integer('Passing grade TKP harus bilangan bulat')
        .min(0, 'Passing grade TKP minimal 0')
        .max(999, 'Passing grade TKP maksimal 999'),
    }),
    examToken: Yup.string()
      .trim()
      .min(6, 'Exam token minimal 6 karakter')
      .max(32, 'Exam token maksimal 32 karakter')
      .matches(/^[A-Za-z0-9-]+$/, 'Exam token hanya boleh berisi huruf, angka, dan tanda hubung')
      .required('Exam token is required.'),
    tryoutOrder: Yup.number()
      .transform((value, originalValue) => originalValue === '' ? null : value)
      .typeError('Urutan try out harus berupa angka')
      .integer('Urutan try out harus bilangan bulat')
      .positive('Urutan try out harus lebih dari 0')
      .nullable(),
});

export const AddEditQuestionValidation = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    correct: Yup.string().required('Correct Option is Required.'),
    options: Yup.array().of(
        Yup.object().shape({
            value: Yup.string().required('Required.'),
        })
    ),
})

export const AddEditQuestionValidationNew = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    type: Yup.string().required('Type is required.'),
    answerType: Yup.string().required('Answer type is required.'),
    correctAnswer: Yup.string().when('answerType', {
      is: (answerType: string) => answerType === 'SHORT_TEXT' || answerType === 'NUMERIC',
      then: (schema) => schema.required('Correct answer is required.'),
      otherwise: (schema) => schema.notRequired(),
    }),
    // correct: Yup.string().required('Correct Option is Required.'),
    // correct: Yup.string().when('type', {
    //   is: (type:any) => type !== 'TPA', // Jika 'type' bukan 'TPA'
    //   then: Yup.string().required('Correct Option is Required'), // Maka 'correct' harus diisi
    //   otherwise: Yup.string().notRequired(), // Jika 'type' adalah 'TPA', 'correct' tidak diperlukan
    // }),
    poin: Yup.number(), // Validate poin normally without conditions
    options: Yup.array().when('answerType', {
      is: (answerType: string) => answerType === 'SHORT_TEXT' || answerType === 'NUMERIC',
      then: (schema) => schema.notRequired(),
      otherwise: (schema) =>
        schema.of(
          Yup.object().shape({
            value: Yup.string().required('Required.'),
            poin: Yup.number().required('Poin is required for each option.'),
          })
        ),
    }),
  });

  export const FiltersValidation = Yup.object().shape({
    search: Yup.string().nullable(),
    tags: Yup.string().nullable(),
})
