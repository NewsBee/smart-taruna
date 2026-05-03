export const errorMessages = {
    default: 'Terjadi kesalahan. Silakan coba lagi.',
    notFound: (resource?: string) => `${translateResourceName(resource)} tidak ditemukan.`,
    auth403: `Anda tidak memiliki izin untuk melakukan aksi ini.`,
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
        `Berhasil ${translateAction(action)} ${translateResource(resource)}`,
}

export const loadingMessages = {
    actionLoading: (action: TactionLoading, resource?: TResource) =>
        `${translateAction(action)} ${translateResource(resource)}`,
}

const translateAction = (action: TactionSuccess | TactionLoading) => {
    const dictionary: Record<TactionSuccess | TactionLoading, string> = {
        Updated: 'memperbarui',
        Deleted: 'menghapus',
        Membuat: 'membuat',
        Updating: 'Memperbarui',
        Deleting: 'Menghapus',
        Creating: 'Membuat',
    };

    return dictionary[action] || action;
};

const translateResource = (resource?: TResource) => {
    if (resource === 'Question') return 'soal';
    if (resource === 'Paket') return 'paket';
    return 'data';
};

const translateResourceName = (resource?: string) => {
    const dictionary: Record<string, string> = {
        Quiz: 'Paket ujian',
        Question: 'Soal',
        Questions: 'Soal',
        Attempt: 'Sesi ujian',
        Paket: 'Paket',
    };

    return resource ? dictionary[resource] || resource : 'Data';
};

export const emptyResponseMessages = {
    attempt: ['Anda belum pernah mengerjakan soal ini.'],
    responses: ["Jawaban hanya ditampilkan untuk sesi ujian yang sudah selesai."],
    dashboardQuizes: ['Belum ada paket ujian yang dibuat.'],
    quizQuestions: ['Paket ini belum memiliki soal.'],
    mainQuizes: ['Belum ada paket ujian aktif saat ini.', 'Silakan buat paket ujian terlebih dahulu.'],
    filteredQuizes: ['Tidak ada paket ujian aktif yang cocok dengan filter.'],
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
