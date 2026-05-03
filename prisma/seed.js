const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

const skdPackages = [
  {
    title: "Paket SKD Token A - Nasionalisme",
    description:
      "Paket SKD berbasis token untuk pengujian randomisasi. Fokus soal: nasionalisme, UUD 1945, numerik dasar, verbal, dan perilaku kerja.",
    token: "SKD-A-2026",
    offset: 0,
    tryoutOrder: 1,
  },
  {
    title: "Paket SKD Token B - Integritas",
    description:
      "Paket SKD berbasis token kedua untuk memastikan token berbeda membuka paket dan urutan soal yang berbeda.",
    token: "SKD-B-2026",
    offset: 240,
    tryoutOrder: 2,
  },
];

const tpaPackages = [
  {
    title: "Paket TPA Token A - Potensi Akademik",
    description:
      "Paket TPA berbasis token untuk latihan potensi akademik, penalaran verbal, numerik, logika, dan analisis bacaan.",
    token: "TPA-A-2026",
    offset: 120,
    tryoutOrder: 1,
  },
];

function choice(content, isCorrect, scoreValue) {
  return { content, isCorrect, scoreValue };
}

function makeMultipleChoice(type, content, correct, wrongChoices, explanation) {
  return {
    content,
    type,
    answerType: "MULTIPLE_CHOICE",
    explanation,
    choices: [
      choice(correct, true, 5),
      ...wrongChoices.map((wrong) => choice(wrong, false, 0)),
    ],
  };
}

function makeScoredChoice(content, choices, explanation) {
  return {
    content,
    type: "TKP",
    answerType: "SCORED_CHOICE",
    explanation,
    choices: choices.map((item) => choice(item.content, true, item.score)),
  };
}

function makeTiuQuestions(offset) {
  const questions = [];

  for (let index = 1; index <= 35; index += 1) {
    const a = 2 + ((index + offset) % 8);
    const x = 4 + ((index + offset) % 9);
    const b = 3 + ((index * 2 + offset) % 17);
    const result = a * x + b;
    questions.push(
      makeMultipleChoice(
        "TIU",
        `TIU Numerik ${index}: Jika ${a}x + ${b} = ${result}, nilai x adalah ...`,
        String(x),
        [String(x + 1), String(x - 1), String(a + b), String(result - b)],
        `Kurangi kedua ruas dengan ${b}, lalu bagi dengan ${a}. Nilai x = ${x}.`
      )
    );
  }

  const verbalPairs = [
    ["konstitusi", "undang-undang dasar", "regulasi", "perjanjian", "kebijakan", "putusan"],
    ["integritas", "kejujuran", "popularitas", "keluwesan", "kekuasaan", "kecepatan"],
    ["plural", "majemuk", "tunggal", "seragam", "terbatas", "terpusat"],
    ["efisien", "hemat guna", "rumit", "lambat", "boros", "acak"],
    ["akuntabel", "dapat dipertanggungjawabkan", "tertutup", "sementara", "formal", "subjektif"],
    ["inovatif", "menciptakan pembaruan", "pasif", "kaku", "repetitif", "konvensional"],
    ["konsisten", "ajek", "berubah-ubah", "ragu-ragu", "sporadis", "sementara"],
    ["netral", "tidak memihak", "condong", "ekstrem", "pribadi", "tertutup"],
  ];

  for (let index = 1; index <= 25; index += 1) {
    const pair = verbalPairs[(index + offset) % verbalPairs.length];
    questions.push(
      makeMultipleChoice(
        "TIU",
        `TIU Verbal ${index}: Sinonim paling tepat dari kata "${pair[0]}" adalah ...`,
        pair[1],
        pair.slice(2),
        `Kata "${pair[0]}" paling dekat maknanya dengan "${pair[1]}".`
      )
    );
  }

  const analogyPairs = [
    ["Dokter", "Pasien", "Guru", "Murid", "Hakim", "Perkara", "Petani", "Ladang"],
    ["Buku", "Membaca", "Peta", "Menavigasi", "Pisau", "Memasak", "Kunci", "Mengunci"],
    ["Kompas", "Arah", "Termometer", "Suhu", "Jam", "Waktu", "Speedometer", "Kecepatan"],
    ["Benih", "Tanaman", "Ide", "Program", "Rencana", "Evaluasi", "Data", "Arsip"],
    ["Hukum", "Keadilan", "Pendidikan", "Pengetahuan", "Disiplin", "Kebiasaan", "Latihan", "Hasil"],
  ];

  for (let index = 1; index <= 20; index += 1) {
    const item = analogyPairs[(index + offset) % analogyPairs.length];
    questions.push(
      makeMultipleChoice(
        "TIU",
        `TIU Analogi ${index}: ${item[0]} berhubungan dengan ${item[1]}, sebagaimana ${item[2]} berhubungan dengan ...`,
        item[3],
        [item[5], item[7], item[0], item[6]],
        `Hubungannya adalah subjek dengan objek/tujuan utamanya: ${item[2]} berhubungan dengan ${item[3]}.`
      )
    );
  }

  return questions;
}

function makeTwkQuestions(offset) {
  const concepts = [
    {
      topic: "Pancasila",
      content: "Sila ketiga Pancasila menekankan nilai ...",
      correct: "persatuan bangsa di atas kepentingan golongan",
      wrong: [
        "kebebasan individu tanpa batas",
        "dominasi satu kelompok masyarakat",
        "pemisahan kepentingan daerah dari negara",
        "pengutamaan kepentingan pribadi",
      ],
      explanation: "Sila ketiga berbunyi Persatuan Indonesia.",
    },
    {
      topic: "UUD 1945",
      content: "Pasal 1 ayat 3 UUD 1945 menegaskan bahwa Indonesia adalah negara ...",
      correct: "hukum",
      wrong: ["kekuasaan", "federal", "monarki", "serikat ekonomi"],
      explanation: "Pasal 1 ayat 3 UUD 1945 menyatakan Indonesia adalah negara hukum.",
    },
    {
      topic: "Bhinneka Tunggal Ika",
      content: "Makna Bhinneka Tunggal Ika dalam kehidupan berbangsa adalah ...",
      correct: "berbeda-beda tetapi tetap satu",
      wrong: [
        "semua warga harus memiliki kebudayaan yang sama",
        "daerah boleh mengabaikan hukum nasional",
        "perbedaan harus dihapus dalam masyarakat",
        "kelompok mayoritas selalu menjadi penentu",
      ],
      explanation: "Bhinneka Tunggal Ika menegaskan persatuan dalam keberagaman.",
    },
    {
      topic: "NKRI",
      content: "Sikap yang mencerminkan komitmen terhadap NKRI adalah ...",
      correct: "menaati hukum dan menjaga persatuan di lingkungan masing-masing",
      wrong: [
        "menyebarkan informasi provokatif",
        "mengutamakan kepentingan daerah dengan menolak aturan nasional",
        "mengabaikan musyawarah dalam masyarakat",
        "mendahulukan kepentingan kelompok sendiri",
      ],
      explanation: "Komitmen NKRI tampak dari kepatuhan hukum dan menjaga persatuan.",
    },
    {
      topic: "Wawasan Nusantara",
      content: "Wawasan Nusantara memandang wilayah Indonesia sebagai ...",
      correct: "satu kesatuan politik, ekonomi, sosial budaya, dan pertahanan keamanan",
      wrong: [
        "kumpulan wilayah yang berdiri sendiri",
        "satu kesatuan ekonomi saja",
        "wilayah yang dipisahkan oleh kepentingan daerah",
        "sistem sosial tanpa dimensi pertahanan",
      ],
      explanation: "Wawasan Nusantara memandang Indonesia sebagai satu kesatuan utuh.",
    },
    {
      topic: "Demokrasi Pancasila",
      content: "Pengambilan keputusan dalam Demokrasi Pancasila idealnya mengutamakan ...",
      correct: "musyawarah untuk mufakat",
      wrong: [
        "tekanan kelompok paling kuat",
        "keputusan sepihak pimpinan",
        "voting tanpa diskusi",
        "kepentingan pribadi pejabat",
      ],
      explanation: "Musyawarah untuk mufakat adalah ciri penting Demokrasi Pancasila.",
    },
  ];

  const questions = [];
  for (let index = 1; index <= 80; index += 1) {
    const concept = concepts[(index + offset) % concepts.length];
    questions.push(
      makeMultipleChoice(
        "TWK",
        `TWK ${concept.topic} ${index}: ${concept.content}`,
        concept.correct,
        concept.wrong,
        concept.explanation
      )
    );
  }

  return questions;
}

function makeTkpQuestions(offset) {
  const scenarios = [
    {
      content:
        "Anda melihat rekan kerja menerima bingkisan dari pihak yang sedang mengurus layanan. Sikap terbaik adalah ...",
      options: [
        ["Menolak gratifikasi, mengingatkan rekan secara sopan, dan melaporkan sesuai prosedur", 5],
        ["Mengingatkan rekan agar berkonsultasi kepada atasan langsung", 4],
        ["Menyimpan informasi sambil mengamati kejadian berikutnya", 3],
        ["Membiarkan karena bukan tanggung jawab pribadi", 2],
        ["Ikut menerima karena nilainya dianggap kecil", 1],
      ],
    },
    {
      content:
        "Sistem pelayanan sedang lambat sementara antrean masyarakat panjang. Respons paling tepat adalah ...",
      options: [
        ["Memberi informasi jelas, membuka kanal bantuan, dan berkoordinasi mempercepat layanan", 5],
        ["Meminta masyarakat menunggu sambil mencari penyebab gangguan", 4],
        ["Memprioritaskan orang yang paling mendesak tanpa penjelasan umum", 3],
        ["Menutup loket sampai sistem kembali normal", 2],
        ["Menyalahkan tim teknis di depan masyarakat", 1],
      ],
    },
    {
      content:
        "Anda diminta menyelesaikan laporan saat data dari unit lain belum lengkap. Tindakan terbaik adalah ...",
      options: [
        ["Mengonfirmasi data yang kurang, menetapkan batas waktu, dan menyusun bagian yang sudah valid", 5],
        ["Menunggu semua data terkumpul meski tenggat makin dekat", 3],
        ["Mengisi data perkiraan agar laporan cepat selesai", 1],
        ["Meminta atasan membatalkan laporan", 2],
        ["Mengerjakan bagian mudah dahulu tanpa koordinasi", 4],
      ],
    },
    {
      content:
        "Dalam tim, ada anggota baru yang belum memahami prosedur kerja. Sikap paling profesional adalah ...",
      options: [
        ["Membantu menjelaskan prosedur dan memastikan ia dapat bekerja sesuai standar", 5],
        ["Memberi dokumen prosedur dan menawarkan bantuan bila dibutuhkan", 4],
        ["Membiarkannya belajar sendiri dari kesalahan", 2],
        ["Mengambil alih semua pekerjaannya", 3],
        ["Mengkritiknya karena belum memahami pekerjaan", 1],
      ],
    },
    {
      content:
        "Anda menemukan kesalahan kecil pada dokumen yang sudah hampir dikirim. Sikap terbaik adalah ...",
      options: [
        ["Memperbaiki kesalahan, mencatat perubahan, dan memastikan versi akhir terkirim benar", 5],
        ["Memberi tahu atasan lalu menunggu arahan", 4],
        ["Mengirim dokumen karena kesalahannya kecil", 2],
        ["Meminta orang lain bertanggung jawab", 1],
        ["Menunda pengiriman tanpa pemberitahuan", 3],
      ],
    },
  ];

  const questions = [];
  for (let index = 1; index <= 80; index += 1) {
    const scenario = scenarios[(index + offset) % scenarios.length];
    questions.push(
      makeScoredChoice(
        `TKP ${index}: ${scenario.content}`,
        scenario.options.map(([content, score]) => ({ content, score })),
        "Skor tertinggi diberikan pada pilihan yang menunjukkan integritas, pelayanan publik, koordinasi, dan tanggung jawab."
      )
    );
  }

  return questions;
}

function makeTpaQuestions(offset) {
  const questions = [];

  for (let index = 1; index <= 60; index += 1) {
    const a = 3 + ((index + offset) % 12);
    const b = 2 + ((index * 3 + offset) % 15);
    const c = a * 4 + b;
    questions.push(
      makeMultipleChoice(
        "TPA",
        `TPA Numerik ${index}: Jika ${a} x 4 + ${b} = ${c}, maka nilai yang benar adalah ...`,
        String(c),
        [String(c + 3), String(c - 2), String(a + b), String(a * b)],
        `Hitung ${a} x 4 = ${a * 4}, lalu tambah ${b}. Hasilnya ${c}.`
      )
    );
  }

  const verbalItems = [
    ["analitis", "mampu menguraikan masalah secara logis", "emosional", "pasif", "acak", "tertutup"],
    ["komprehensif", "menyeluruh", "terbatas", "singkat", "dangkal", "parsial"],
    ["implisit", "tersirat", "terang-terangan", "langsung", "terucap", "terlihat"],
    ["valid", "sah dan dapat diterima", "lemah", "keliru", "sementara", "kabur"],
    ["objektif", "berdasarkan fakta", "memihak", "personal", "dugaan", "emosional"],
    ["inferensi", "kesimpulan dari bukti", "pertanyaan awal", "contoh acak", "data mentah", "pendapat bebas"],
  ];

  for (let index = 1; index <= 60; index += 1) {
    const item = verbalItems[(index + offset) % verbalItems.length];
    questions.push(
      makeMultipleChoice(
        "TPA",
        `TPA Verbal ${index}: Makna paling tepat dari "${item[0]}" adalah ...`,
        item[1],
        item.slice(2),
        `"${item[0]}" paling tepat dimaknai sebagai ${item[1]}.`
      )
    );
  }

  const logicItems = [
    {
      premise: "Semua peserta yang lulus administrasi mengikuti ujian. Raka lulus administrasi.",
      correct: "Raka mengikuti ujian",
      wrong: ["Raka pasti lulus ujian", "Raka tidak perlu ujian", "Semua peserta pasti lulus", "Administrasi tidak berpengaruh"],
    },
    {
      premise: "Jika jadwal berubah, panitia mengirim pengumuman. Tidak ada pengumuman dari panitia.",
      correct: "Jadwal tidak berubah",
      wrong: ["Jadwal pasti berubah", "Panitia lupa bekerja", "Peserta bebas datang kapan saja", "Pengumuman tidak diperlukan"],
    },
    {
      premise: "Semua modul numerik memuat latihan hitung. Paket A adalah modul numerik.",
      correct: "Paket A memuat latihan hitung",
      wrong: ["Paket A hanya berisi verbal", "Semua latihan hitung pasti Paket A", "Paket A tidak dapat dipelajari", "Modul numerik tidak punya soal"],
    },
  ];

  for (let index = 1; index <= 60; index += 1) {
    const item = logicItems[(index + offset) % logicItems.length];
    questions.push(
      makeMultipleChoice(
        "TPA",
        `TPA Logika ${index}: ${item.premise} Kesimpulan yang tepat adalah ...`,
        item.correct,
        item.wrong,
        "Kesimpulan mengikuti hubungan sebab-akibat atau himpunan yang disebutkan pada premis."
      )
    );
  }

  const readingTopics = [
    "Disiplin belajar membantu peserta menjaga konsistensi latihan dan mengurangi kesalahan yang berulang.",
    "Evaluasi hasil try out berguna untuk menentukan materi yang perlu diprioritaskan pada sesi latihan berikutnya.",
    "Manajemen waktu diperlukan agar peserta tidak menghabiskan terlalu banyak waktu pada satu soal.",
    "Latihan berbasis pembahasan membantu peserta memahami alasan jawaban benar dan memperbaiki strategi pengerjaan.",
  ];

  for (let index = 1; index <= 60; index += 1) {
    const topic = readingTopics[(index + offset) % readingTopics.length];
    questions.push(
      makeMultipleChoice(
        "TPA",
        `TPA Pemahaman Bacaan ${index}: "${topic}" Gagasan utama kalimat tersebut adalah ...`,
        topic.split(" membantu ")[0].replace(" diperlukan agar peserta tidak menghabiskan terlalu banyak waktu pada satu soal.", "Manajemen waktu"),
        [
          "Pembahasan tidak diperlukan dalam latihan",
          "Try out tidak membutuhkan evaluasi",
          "Semua soal harus dikerjakan tanpa strategi",
          "Latihan cukup dilakukan sekali",
        ],
        "Gagasan utama diambil dari inti pembahasan pada awal kalimat."
      )
    );
  }

  return questions;
}

function buildSkdQuestions(offset) {
  return [
    ...makeTwkQuestions(offset),
    ...makeTiuQuestions(offset),
    ...makeTkpQuestions(offset),
  ];
}

async function upsertUser(email, username, role, password) {
  await prisma.user.upsert({
    where: { email },
    update: { username, role },
    create: {
      username,
      email,
      password,
      role,
    },
  });
}

async function upsertPackage(data) {
  const { passingGrades, ...packageData } = data;
  const passingGradeMutation = passingGrades?.length
    ? {
        passingGrades: {
          deleteMany: {},
          createMany: {
            data: passingGrades,
          },
        },
      }
    : {};
  const existing = await prisma.package.findFirst({
    where: {
      testName: packageData.testName,
      title: packageData.title,
    },
  });

  if (existing) {
    return prisma.package.update({
      where: { id: existing.id },
      data: {
        ...packageData,
        ...passingGradeMutation,
      },
    });
  }

  return prisma.package.create({
    data: {
      ...packageData,
      ...(passingGrades?.length
        ? {
            passingGrades: {
              createMany: {
                data: passingGrades,
              },
            },
          }
        : {}),
    },
  });
}

async function replacePackageQuestions(packageId, questions) {
  await prisma.question.deleteMany({ where: { packageId } });

  for (const question of questions) {
    await prisma.question.create({
      data: {
        content: question.content,
        type: question.type,
        answerType: question.answerType,
        explanation: question.explanation,
        packageId,
        Choices: {
          createMany: {
            data: question.choices,
          },
        },
      },
    });
  }
}

async function main() {
  const password = await hash("password123", 10);

  await upsertUser("admin@smarttaruna.test", "Admin Smart Taruna", "admin", password);
  await upsertUser("siswa@smarttaruna.test", "Siswa Demo", "siswa", password);

  const skd = await prisma.test.upsert({
    where: { name: "SKD" },
    update: {},
    create: { name: "SKD" },
  });

  const tpa = await prisma.test.upsert({
    where: { name: "TPA" },
    update: {},
    create: { name: "TPA" },
  });

  await prisma.package.updateMany({
    where: { testName: { in: ["tkp", "TKP"] } },
    data: {
      isHidden: true,
      isLocked: true,
    },
  });

  for (const seededPackage of skdPackages) {
    const pkg = await upsertPackage({
      testName: skd.name,
      title: seededPackage.title,
      description: seededPackage.description,
      duration: 120,
      maxAttempts: 2,
      passingGrades: [
        { type: "TWK", minScore: 65 },
        { type: "TIU", minScore: 80 },
        { type: "TKP", minScore: 166 },
      ],
      isLocked: false,
      isHidden: false,
      examToken: seededPackage.token,
      tryoutOrder: seededPackage.tryoutOrder,
    });

    const questions = buildSkdQuestions(seededPackage.offset);
    await replacePackageQuestions(pkg.id, questions);
    console.log(
      `${seededPackage.title}: ${questions.length} soal, token ${seededPackage.token}`
    );
  }

  for (const seededPackage of tpaPackages) {
    const pkg = await upsertPackage({
      testName: tpa.name,
      title: seededPackage.title,
      description: seededPackage.description,
      duration: 100,
      maxAttempts: 2,
      passingGrades: [],
      isLocked: false,
      isHidden: false,
      examToken: seededPackage.token,
      tryoutOrder: seededPackage.tryoutOrder,
    });

    const questions = makeTpaQuestions(seededPackage.offset);
    await replacePackageQuestions(pkg.id, questions);
    console.log(
      `${seededPackage.title}: ${questions.length} soal, token ${seededPackage.token}`
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
