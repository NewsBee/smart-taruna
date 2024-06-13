import * as Yup from 'yup';

export const AddEditQuizValidation = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    description: Yup.string().required('Description is required.'),
    tags: Yup.array().of(Yup.string()).min(1, 'At least one tag is required'),
    duration: Yup.number()
        .typeError('Duration must be a number')
        .positive('Duration must be positive')
      .required('Duration is required'),
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
  options: Yup.array().of(
    Yup.object().shape({
      value: Yup.string(),
      poin: Yup.number().required('Poin is required for each option.'),
      image: Yup.string(),
    })
  ).required('Options are required.')
    .min(1, 'At least one option is required.')
    .test('options-validation', 'Each option must have either a value or an image.', function(options) {
      return (options || []).every(option => option.value || option.image);
    }),
});

export const FiltersValidation = Yup.object().shape({
  search: Yup.string().nullable(),
  tags: Yup.string().nullable(),
});