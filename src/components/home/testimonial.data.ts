import type { Testimonial } from '@/interfaces/testimonial'

export const data: Array<Testimonial> = [
  {
    id: 1,
    title: 'Latihan lebih terarah',
    content:
      'Paket latihan membantu siswa membiasakan diri dengan batas waktu, variasi soal, dan evaluasi nilai per kategori.',
    user: {
      id: 1,
      name: 'Raka Pratama',
      professional: 'Siswa Try Out SKD',
      photo: '1.jpg',
    },
  },
  {
    id: 2,
    title: 'Monitoring ujian jelas',
    content:
      'Admin dapat melihat peserta yang sedang mengerjakan, jawaban yang sudah tersimpan, dan catatan aktivitas selama sesi ujian.',
    user: {
      id: 1,
      name: 'Riski Amelia',
      professional: 'Admin Bimbel',
      photo: '2.jpg',
    },
  },
  {
    id: 3,
    title: 'Rekap nilai mudah dibaca',
    content:
      'Hasil try out bisa dipantau berdasarkan paket, sehingga perkembangan siswa dari TO 1 ke TO berikutnya lebih mudah dianalisis.',
    user: {
      id: 1,
      name: 'Dimas Nugroho',
      professional: 'Koordinator Kelas',
      photo: '3.jpg',
    },
  },
  {
    id: 4,
    title: 'Akses paket memakai token',
    content:
      'Setiap paket bisa diberi token berbeda sehingga siswa hanya dapat membuka sesi ujian yang memang sedang dijadwalkan.',
    user: {
      id: 1,
      name: 'Nadya Putri',
      professional: 'Pengelola Try Out',
      photo: '4.jpg',
    },
  },
  {
    id: 5,
    title: 'Evaluasi soal lebih cepat',
    content:
      'Analisis soal membantu admin menemukan soal yang terlalu sulit, sering salah, atau perlu diperbaiki sebelum try out berikutnya.',
    user: {
      id: 1,
      name: 'Fajar Saputra',
      professional: 'Tim Akademik',
      photo: '5.jpg',
    },
  },
]
