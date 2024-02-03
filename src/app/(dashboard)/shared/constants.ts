export const errorMessages = {
    default: 'Something went wrong, please try again later.',
    notFound: (resource?: string) => `${resource || 'Resource'} not found.`,
    auth403: `You do not have the permission to do this action.`,
}

export const globalColors = {
    brand: '#4f46e5',
    red: '#e11d48'
}

type TactionSuccess =
    | 'Updated'
    | 'Deleted'
    | 'Membuat';

type TactionLoading =
    | 'Updating'
    | 'Deleting'
    | 'Creating';

type TResource = 'Question' | 'Paket'

export const successMessages = {
    actionSuccess: (action: TactionSuccess, resource?: TResource) =>
        `Berhasil ${action} ${resource || 'resource'}`,
}

export const loadingMessages = {
    actionLoading: (action: TactionLoading, resource?: TResource) =>
        `${action} ${resource || 'resource'}`,
}

export const emptyResponseMessages = {
    attempt: ['Anda belum pernah mengerjakan soal ini.'],
    responses: ["You can only see responses to first attempt at any quiz."],
    dashboardQuizes: ['You have not created any quizes yet.'],
    quizQuestions: ['This quiz have no questions.'],
    mainQuizes: ['There are no active Quizes at the moment.', 'Go ahead make a Quiz.'],
    filteredQuizes: ['No active Quizes found with the given filters.'],
}

export const uiMessages = {
    allowedMarkingACorrectOption: ['* Menandai opsi yang benar hanya diizinkan setelah Anda telah menuliskan semua opsi.'],
    warnQuestionCreate: ['Catatan: Harap berhati-hati sebelum membuat/mengedit pertanyaan karena jika Anda harus mengeditnya nanti, Anda akan kehilangan semua respons terhadap pertanyaan tersebut. Hal ini dilakukan agar kami dapat memberikan Anda statistik yang lebih baik dan akurat.']
}

export const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40vw',
    bgcolor: '#ffffff',
    overflow: 'auto',
    boxShadow: 24,
    padding: '1rem 2rem',
    border: 0,
    borderRadius: '6px',
};
