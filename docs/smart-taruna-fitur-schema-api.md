# Dokumentasi Fitur, Schema Database, dan API Smart Taruna

Dokumen ini menjelaskan fitur yang tersedia pada aplikasi Smart Taruna, model database yang terlibat, endpoint API yang digunakan, dan alur utama data dari sisi peserta serta admin.

## 1. Gambaran Umum Aplikasi

Smart Taruna adalah aplikasi try out/CBT berbasis Next.js App Router, NextAuth, Prisma, dan MySQL. Aplikasi memiliki dua peran utama:

- Siswa: login, mengakses ujian menggunakan token, mengerjakan soal, autosave jawaban, melihat riwayat dan hasil try out.
- Admin: mengelola paket ujian, soal, token sesi CBT, user, monitoring sesi aktif, log aktivitas, export nilai, dan analitik performa siswa.

Fitur pengamanan CBT yang sudah tersedia:

- Login user dan role-based access.
- Login/register manual dan Google OAuth.
- Token ujian untuk membuka paket soal tertentu.
- Randomisasi soal dan pilihan jawaban per attempt.
- Batas soal tampil untuk peserta: 110 soal dari bank soal paket.
- Autosave jawaban.
- Heartbeat atau status terakhir aktif.
- Deteksi perpindahan tab/window.
- Log aktivitas user untuk admin.
- Monitoring sesi ujian aktif.

## 2. Schema Database Utama

Schema Prisma berada di `prisma/schema.prisma`.

### 2.1 User

Model `User` menyimpan akun siswa dan admin.

Field penting:

- `id`: primary key user.
- `username`: nama user, unik.
- `email`: email user, unik.
- `password`: password hashed untuk login credentials.
- `role`: `siswa` atau `admin`.
- `attempts`: relasi ke attempt ujian.
- `securityEvents`: relasi ke log aktivitas user.
- `gender`, `phoneNumber`, `education`, `major`, `institution`: data profil.
- `profileImage`, `bio`, `birthDate`: data tambahan profil.

Dipakai oleh fitur:

- Login/register.
- Google login/register.
- Middleware role access.
- Profile siswa.
- Riwayat dan hasil try out.
- Dashboard admin, manajemen user, export, analitik, monitoring.

API terkait:

- `POST /api/user`
- `GET /api/profile`
- `POST /api/profile`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `POST /api/admin/users/[id]/reset-password`
- `GET /api/admin/analytics`
- `GET /api/admin/export`

### 2.2 SocialLink

Model `SocialLink` menyimpan link sosial milik user.

Field penting:

- `id`
- `userId`
- `platform`
- `link`

Dipakai oleh fitur:

- Profile user.

API terkait:

- `GET /api/profile`

### 2.3 Test

Model `Test` menyimpan kategori ujian, misalnya `SKD`, `TPA`, atau `tkp`.

Field penting:

- `id`
- `name`
- `packages`: daftar paket pada test tersebut.
- `attempts`: attempt yang mengambil test tersebut.

Dipakai oleh fitur:

- Daftar test.
- Paket ujian per test.
- Attempt ujian.
- Dashboard admin.

API terkait:

- `GET /api/test`
- `GET /api/paket/[slug]`
- `GET /api/admin/analytics`

### 2.4 Package

Model `Package` menyimpan paket soal.

Field penting:

- `id`
- `testName`: relasi ke `Test.name`.
- `title`
- `description`
- `duration`: durasi ujian dalam menit.
- `isHidden`: apakah paket disembunyikan dari siswa.
- `isLocked`: apakah paket terkunci.
- `examToken`: token yang digunakan siswa untuk membuka paket.
- `questions`: soal dalam paket.
- `attempts`: attempt yang memakai paket ini.
- `tags`: tag paket.

Dipakai oleh fitur:

- Kelola paket admin.
- Generate token ujian.
- Akses ujian by token.
- Randomisasi soal per attempt.
- Riwayat dan hasil try out.
- Analitik paket.

API terkait:

- `GET /api/paket/[slug]`
- `POST /api/paket/create`
- `DELETE /api/paket/delete`
- `PUT /api/paket/lock/[idpaket]`
- `PUT /api/paket/hide/[idpaket]`
- `GET /api/paket/info/[id]`
- `PUT /api/paket/token/[id]`
- `POST /api/ujian/token`
- `POST /api/ujian/start/[id]`

### 2.5 Tag

Model `Tag` menyimpan label paket.

Field penting:

- `id`
- `name`
- `packages`

Dipakai oleh fitur:

- Form tambah paket.
- Tampilan kartu paket admin/siswa.

API terkait:

- `POST /api/paket/create`
- `GET /api/paket/[slug]`

### 2.6 Question

Model `Question` menyimpan soal.

Field penting:

- `id`
- `content`: isi soal.
- `type`: tipe soal seperti `TWK`, `TIU`, `TKP`, `TPA`.
- `answerType`: `MULTIPLE_CHOICE`, `SCORED_CHOICE`, `SHORT_TEXT`, atau `NUMERIC`.
- `correctAnswer`: jawaban benar untuk input text/numeric.
- `tolerance`: toleransi jawaban numeric.
- `packageId`
- `image`
- `explanation`
- `Choices`
- `responses`

Dipakai oleh fitur:

- Bank soal admin.
- Player ujian siswa.
- Scoring jawaban.
- Analitik kualitas soal.

API terkait:

- `GET /api/test/[id]/questions`
- `POST /api/test/[id]/questions`
- `DELETE /api/test/[id]/questions`
- `GET /api/test/[id]/quiz`
- `PUT /api/test/[id]/quiz`
- `POST /api/pertanyaan/create/uploadimg/[quizId]`

### 2.7 Choice

Model `Choice` menyimpan pilihan jawaban.

Field penting:

- `id`
- `content`
- `isCorrect`
- `scoreValue`
- `questionId`

Dipakai oleh fitur:

- Pilihan jawaban soal.
- Scoring pilihan ganda.
- Scoring TKP/SCORED_CHOICE.
- Randomisasi pilihan jawaban.

API terkait:

- `GET /api/test/[id]/questions`
- `POST /api/test/[id]/questions`
- `PUT /api/test/[id]/quiz`
- `POST /api/ujian/submit`
- `POST /api/ujian/response`

### 2.8 Attempt

Model `Attempt` menyimpan satu sesi pengerjaan ujian.

Field penting:

- `id`
- `score`
- `testId`
- `packageId`
- `userId`
- `createdAt`
- `completedAt`
- `lastHeartbeatAt`: waktu terakhir peserta aktif.
- `totalPausedMs`: total waktu offline/pause.
- `examTokenVerifiedAt`: waktu token berhasil divalidasi.
- `questionOrder`: urutan 110 soal acak untuk attempt.
- `choiceOrder`: urutan pilihan jawaban acak per soal.
- `responses`
- `securityEvents`

Dipakai oleh fitur:

- Sesi ujian aktif.
- Randomisasi soal dan pilihan.
- Timer dan status selesai.
- Autosave jawaban.
- Submit jawaban.
- Hasil try out.
- Monitoring admin.
- Analitik individu.

API terkait:

- `POST /api/ujian/token`
- `POST /api/ujian/start/[id]`
- `GET /api/ujian/check`
- `GET /api/ujian/check/sesitest`
- `POST /api/ujian/heartbeat`
- `POST /api/ujian/pause`
- `POST /api/ujian/response`
- `POST /api/ujian/submit`
- `GET /api/hasil/[id]`
- `GET /api/hasil/byuser`
- `GET /api/admin/analytics`
- `GET /api/admin/export`

### 2.9 Response

Model `Response` menyimpan jawaban peserta per soal.

Field penting:

- `id`
- `content`: jawaban peserta.
- `score`: nilai jawaban.
- `attemptId`
- `questionId`
- Unique constraint `attemptId_questionId`: satu soal hanya punya satu jawaban aktif per attempt.

Dipakai oleh fitur:

- Autosave jawaban.
- Submit final.
- Hasil ujian.
- Analitik soal.
- Analitik individu.

API terkait:

- `POST /api/ujian/response`
- `POST /api/ujian/submit`
- `GET /api/hasil/[id]`
- `GET /api/admin/analytics`

### 2.10 SecurityEvent

Model `SecurityEvent` menyimpan aktivitas keamanan selama ujian.

Field penting:

- `id`
- `attemptId`
- `userId`
- `type`: contoh `TAB_HIDDEN`, `TAB_VISIBLE`, `WINDOW_BLUR`, `WINDOW_FOCUS`.
- `metadata`: informasi tambahan seperti visibility state, user agent, client time.
- `createdAt`

Dipakai oleh fitur:

- Monitoring tab switching/window switching.
- Log aktivitas user di admin.
- Analitik individu.

API terkait:

- `POST /api/ujian/security-event`
- `GET /api/admin/analytics`

## 3. Fitur Autentikasi dan Otorisasi

### 3.1 Register Manual

Halaman:

- `/auth/sign-up`

Alur:

1. User mengisi nama, email, password, konfirmasi password.
2. Frontend mengirim data ke `POST /api/user`.
3. API melakukan validasi zod.
4. API cek email dan username sudah ada atau belum.
5. Password di-hash dengan bcrypt.
6. Record `User` dibuat dengan role default `siswa`.

Schema:

- `User`

API:

- `POST /api/user`

### 3.2 Login Manual

Halaman:

- `/auth/sign-in`

Alur:

1. User mengisi email dan password.
2. NextAuth Credentials Provider mencari user berdasarkan email.
3. Password dibandingkan dengan hash.
4. Jika valid, JWT session menyimpan `id`, `username`, `role`.

Schema:

- `User`

API:

- `POST /api/auth/[...nextauth]`

### 3.3 Login/Register Google

Halaman:

- `/auth/sign-in`
- `/auth/sign-up`

Alur:

1. User klik tombol Google.
2. NextAuth Google Provider memproses OAuth.
3. Jika email belum ada, aplikasi membuat `User` baru.
4. Username dibuat dari nama/email Google.
5. Password random di-hash karena akun Google tidak memakai password manual.

Schema:

- `User`

API:

- `/api/auth/[...nextauth]`

Catatan environment:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 3.4 Middleware Role Access

File:

- `src/middleware.ts`

Alur:

- User belum login diarahkan ke `/auth/sign-in`.
- User login yang membuka `/auth/sign-in` atau `/auth/sign-up` diarahkan ke `/`.
- Route `/ujian` butuh login.
- Route `/dashboard` hanya boleh role `admin`.
- User siswa yang membuka `/dashboard` diarahkan ke `/ujian`.

Schema:

- `User.role`

## 4. Fitur Siswa

### 4.1 Portal Ujian Token

Halaman:

- `/ujian`

Fungsi:

- Halaman utama siswa untuk masuk ujian menggunakan token.
- Token menentukan paket soal yang dibuka.
- UI menampilkan informasi aturan ujian, randomisasi 110 soal, status keamanan, dan timer.

Alur:

1. Siswa memasukkan token.
2. Frontend mengirim token ke `POST /api/ujian/token`.
3. API mencari `Package` berdasarkan `examToken`, `isHidden=false`, `isLocked=false`.
4. Jika token valid, API membuat atau memakai attempt aktif.
5. API membuat `questionOrder` berisi 110 soal acak dari bank soal paket.
6. API membuat `choiceOrder` berisi urutan pilihan jawaban acak.
7. Siswa diarahkan ke `/ujian/[testName]/[packageId]`.

Schema:

- `Package`
- `Attempt`
- `Question`
- `Choice`

API:

- `POST /api/ujian/token`

### 4.2 Randomisasi Soal dan Jawaban

Fungsi:

- Bank soal dapat berisi lebih dari 110 soal.
- Saat attempt dibuat, sistem hanya mengambil 110 soal acak.
- Urutan soal disimpan di `Attempt.questionOrder`.
- Urutan pilihan jawaban disimpan di `Attempt.choiceOrder`.
- Refresh halaman tidak mengacak ulang karena urutan sudah tersimpan.

Schema:

- `Attempt.questionOrder`
- `Attempt.choiceOrder`
- `Question`
- `Choice`

API:

- `POST /api/ujian/token`
- `POST /api/ujian/start/[id]`
- `GET /api/test/[id]/questions`

File helper:

- `src/app/api/ujian/_security.ts`

### 4.3 Player Ujian

Halaman:

- `/ujian/[...slug]`

Fungsi:

- Menampilkan satu soal aktif.
- Menampilkan opsi jawaban atau input text/numeric.
- Navigasi next/previous.
- Progress jumlah jawaban.
- Countdown durasi paket.
- Warning offline.
- Warning aktivitas keluar tab/window.

Schema:

- `Attempt`
- `Question`
- `Choice`
- `Response`

API:

- `GET /api/test/[id]/questions`
- `GET /api/ujian/check`
- `POST /api/ujian/heartbeat`
- `POST /api/ujian/response`
- `POST /api/ujian/pause`
- `POST /api/ujian/security-event`
- `POST /api/ujian/submit`

### 4.4 Autosave Jawaban

Fungsi:

- Jawaban disimpan saat siswa memilih opsi atau mengetik jawaban.
- API memakai upsert supaya jawaban soal yang sama diperbarui, bukan diduplikasi.
- Score sementara dihitung server-side.

Alur:

1. User menjawab soal.
2. Frontend memanggil `POST /api/ujian/response`.
3. API memvalidasi attempt milik user.
4. API memvalidasi question ada di package attempt.
5. API menghitung score dengan `_scoring.ts`.
6. API upsert ke `Response`.
7. API update `Attempt.lastHeartbeatAt`.

Schema:

- `Attempt`
- `Response`
- `Question`
- `Choice`

API:

- `POST /api/ujian/response`

### 4.5 Submit Ujian

Fungsi:

- Mengirim semua jawaban final.
- Menghitung total skor.
- Menandai attempt selesai.

Alur:

1. User klik submit atau waktu habis.
2. Frontend mengirim semua response ke `POST /api/ujian/submit`.
3. API memvalidasi attempt milik user dan belum selesai.
4. API mengambil soal yang valid dalam package attempt.
5. API menghitung score tiap jawaban.
6. API mengganti response lama dan membuat response final.
7. API update `Attempt.score`, `completedAt`, dan `lastHeartbeatAt`.

Schema:

- `Attempt`
- `Response`
- `Question`
- `Choice`

API:

- `POST /api/ujian/submit`

### 4.6 Scoring Jawaban

File:

- `src/app/api/ujian/_scoring.ts`

Jenis scoring:

- `MULTIPLE_CHOICE`: benar mendapat 5, salah 0.
- `SCORED_CHOICE` atau `TKP`: score mengikuti `Choice.scoreValue`.
- `SHORT_TEXT`: jawaban dinormalisasi lowercase dan spasi, benar mendapat 5.
- `NUMERIC`: angka dibandingkan dengan `correctAnswer` dan `tolerance`.

Schema:

- `Question.answerType`
- `Question.correctAnswer`
- `Question.tolerance`
- `Choice.isCorrect`
- `Choice.scoreValue`
- `Response.score`

### 4.7 Heartbeat atau Terakhir Aktif

Fungsi:

- Browser siswa mengirim sinyal berkala agar server tahu peserta masih aktif.
- Di admin ditampilkan sebagai `Terakhir Aktif`.

Alur:

1. Halaman ujian mengirim `POST /api/ujian/heartbeat`.
2. API memvalidasi attempt milik user.
3. API update `Attempt.lastHeartbeatAt`.

Schema:

- `Attempt.lastHeartbeatAt`

API:

- `POST /api/ujian/heartbeat`

### 4.8 Deteksi Offline/Pause

Fungsi:

- Saat browser offline lalu online lagi, durasi offline dikirim sebagai pause.
- Server menambahkan durasi ke `Attempt.totalPausedMs`.

Schema:

- `Attempt.totalPausedMs`

API:

- `POST /api/ujian/pause`

### 4.9 Monitoring Aktivitas User

Fungsi:

- Mencatat aktivitas peserta keluar dari tab ujian, kembali ke tab, berpindah jendela, dan kembali aktif.
- Bahasa teknis event di UI admin diterjemahkan menjadi bahasa awam.

Mapping label admin:

- `TAB_HIDDEN`: Keluar dari tab ujian.
- `TAB_VISIBLE`: Kembali ke tab ujian.
- `WINDOW_BLUR`: Berpindah dari jendela ujian.
- `WINDOW_FOCUS`: Kembali aktif di jendela ujian.

Schema:

- `SecurityEvent`
- `Attempt`
- `User`

API:

- `POST /api/ujian/security-event`
- `GET /api/admin/analytics`

### 4.10 Riwayat Ujian Siswa

Halaman:

- `/history`

Fungsi:

- Menampilkan attempt milik user.
- User bisa membuka detail hasil.

Schema:

- `Attempt`
- `User`
- `Package`
- `Test`

API:

- `GET /api/hasil/byuser`

### 4.11 Detail Hasil Try Out

Halaman:

- `/hasil/[id]`

Fungsi:

- Menampilkan attempt, jawaban, soal, pilihan, dan hasil scoring.
- User hanya boleh melihat attempt miliknya.
- Admin boleh melihat semua attempt siswa.

Schema:

- `Attempt`
- `Response`
- `Question`
- `Choice`
- `User`
- `Package`

API:

- `GET /api/hasil/[id]`

### 4.12 Profile Siswa

Halaman:

- `/profile`

Fungsi:

- Menampilkan dan update profil.
- Menampilkan ringkasan statistik try out SKD/TPA.
- Upload foto profile.

Schema:

- `User`
- `SocialLink`
- `Attempt`
- `Package`

API:

- `GET /api/profile`
- `POST /api/profile`
- `POST /api/profile/uploadprofile`

## 5. Fitur Admin

### 5.1 Dashboard Admin

Halaman:

- `/dashboard`

Fungsi:

- Ringkasan total siswa, attempt selesai, rata-rata nilai, sesi aktif, paket, bank soal, dan soal perlu evaluasi.
- Tab overview, siswa, monitoring, paket, analisis soal.
- Tombol menuju manajemen user dan kelola paket per test.

Schema:

- `User`
- `Test`
- `Package`
- `Question`
- `Choice`
- `Attempt`
- `Response`
- `SecurityEvent`

API:

- `GET /api/admin/analytics`
- `GET /api/admin/export`

### 5.2 Rekap Nilai Siswa

Halaman:

- `/dashboard`, tab `Siswa`

Fungsi:

- Tabel rekap nilai siswa.
- Pencarian berdasarkan nama atau email.
- Export siswa.
- Modal analitik individu.

Data yang ditampilkan:

- Total attempt.
- Nilai terakhir.
- Nilai tertinggi.
- Rata-rata.
- Jumlah aktivitas keamanan.
- Paket terakhir.

Schema:

- `User`
- `Attempt`
- `Package`
- `Test`
- `Response`
- `SecurityEvent`

API:

- `GET /api/admin/analytics`
- `GET /api/admin/export?type=students`
- `GET /api/hasil/[id]` untuk detail hasil.

### 5.3 Analitik Individu Siswa

Halaman:

- `/dashboard`, tab `Siswa`, tombol `Analitik`

Fungsi:

- Modal ringkasan individu.
- Breakdown performa per paket.
- Daftar hasil try out.
- Tombol `Lihat Hasil` untuk membuka detail attempt.

Schema:

- `User`
- `Attempt`
- `Package`
- `Response`
- `SecurityEvent`

API:

- `GET /api/admin/analytics`
- `GET /api/hasil/[id]`

### 5.4 Monitoring Sesi Aktif

Halaman:

- `/dashboard`, tab `Monitoring`

Fungsi:

- Memantau peserta yang sedang ujian.
- Menampilkan peserta yang perlu perhatian terlebih dahulu.
- Search berdasarkan nama, email, paket, atau test.
- Filter:
  - Perlu perhatian: peserta dengan aktivitas mencurigakan.
  - Normal: peserta tanpa event.
  - Semua.
- Pagination ringan: tampil 20 sesi, tombol tampilkan 20 lagi.
- Menghindari admin harus scroll semua user saat banyak peserta aktif.

Schema:

- `Attempt`
- `User`
- `Package`
- `Response`
- `SecurityEvent`

API:

- `GET /api/admin/analytics`

### 5.5 Log Aktivitas User

Halaman:

- `/dashboard`, tab `Monitoring`

Fungsi:

- Menampilkan log aktivitas terbaru.
- Search berdasarkan nama, email, aktivitas, paket, atau test.
- Event teknis diterjemahkan menjadi bahasa mudah dimengerti.

Schema:

- `SecurityEvent`
- `Attempt`
- `User`
- `Package`

API:

- `GET /api/admin/analytics`

### 5.6 Analisis Kualitas Soal

Halaman:

- `/dashboard`, tab `Analisis Soal`

Fungsi:

- Menampilkan soal yang punya rasio benar rendah.
- Membantu admin menemukan soal yang terlalu sulit, ambigu, atau perlu revisi.
- Data diurutkan dari rasio benar paling rendah.

Schema:

- `Question`
- `Choice`
- `Response`
- `Attempt`
- `Package`

API:

- `GET /api/admin/analytics`

### 5.7 Manajemen Paket

Halaman:

- `/dashboard/[slug]`, misalnya `/dashboard/SKD` atau `/dashboard/tkp`

Fungsi:

- Menampilkan paket pada test tertentu.
- Statistik total paket, paket aktif, total soal, paket hidden.
- Kartu paket modern dengan token, status, jumlah soal, durasi, attempt.
- Salin token.
- Generate token baru.
- Kelola soal.
- Lock/unlock.
- Hide/show.
- Hapus paket.

Schema:

- `Test`
- `Package`
- `Tag`
- `Question`
- `Attempt`

API:

- `GET /api/paket/[slug]`
- `GET /api/paket/info/[id]`
- `PUT /api/paket/token/[id]`
- `PUT /api/paket/lock/[idpaket]`
- `PUT /api/paket/hide/[idpaket]`
- `DELETE /api/paket/delete`

### 5.8 Generate Token Ujian

Halaman:

- `/dashboard/[slug]`

Fungsi:

- Admin dapat membuat ulang token paket.
- Token disimpan di `Package.examToken`.
- Siswa memakai token ini di halaman `/ujian`.
- Token yang berbeda membuka paket berbeda.

Schema:

- `Package.examToken`

API:

- `PUT /api/paket/token/[id]`
- `POST /api/ujian/token`

### 5.9 Buat Paket

Halaman:

- `/dashboard/[slug]/create`

Fungsi:

- Membuat paket baru.
- Mengisi nama paket, deskripsi, durasi, token ujian, dan tag.

Schema:

- `Package`
- `Tag`
- `Test`

API:

- `POST /api/paket/create`

### 5.10 Kelola Soal Paket

Halaman:

- `/dashboard/[slug]/[id]`

Fungsi:

- Melihat daftar soal paket.
- Menambah soal.
- Melihat progress jumlah soal.
- Membuka halaman update soal.

Schema:

- `Package`
- `Question`
- `Choice`

API:

- `GET /api/test/[id]/questions`
- `POST /api/test/[id]/questions`
- `DELETE /api/test/[id]/questions`

Catatan:

- Endpoint `GET /api/test/[id]/questions` punya dua mode:
  - Admin mendapat data lengkap, termasuk kunci jawaban dan score pilihan.
  - Siswa mendapat data aman tanpa kunci jawaban.

### 5.11 Update Soal

Halaman:

- `/dashboard/[slug]/[id]/update/[quizid]`

Fungsi:

- Mengubah isi soal, tipe, answer type, jawaban benar, toleransi numeric, pilihan, poin, penjelasan, dan gambar.

Schema:

- `Question`
- `Choice`

API:

- `GET /api/test/[id]/quiz`
- `PUT /api/test/[id]/quiz`

### 5.12 Upload Gambar Soal dan Profile

Fungsi:

- Upload gambar soal.
- Upload foto profil user.

Schema:

- `Question.image`
- `User.profileImage`

API:

- `POST /api/pertanyaan/create/uploadimg/[quizId]`
- `POST /api/profile/uploadprofile`

### 5.13 Manajemen User

Halaman:

- `/dashboard/users`

Fungsi:

- Melihat daftar user.
- Search user.
- Update role/data user.
- Reset password user.

Schema:

- `User`
- `Attempt`

API:

- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `POST /api/admin/users/[id]/reset-password`

### 5.14 Export Nilai

Fungsi:

- Export data attempt.
- Export rekap siswa.
- Format CSV.

Schema:

- `User`
- `Attempt`
- `Package`
- `Test`

API:

- `GET /api/admin/export?type=attempts`
- `GET /api/admin/export?type=students`

## 6. Alur Ujian End-to-End

### 6.1 Alur dari Siswa Memasukkan Token sampai Mengerjakan

1. Siswa login.
2. Siswa membuka `/ujian`.
3. Siswa memasukkan token.
4. Frontend memanggil `POST /api/ujian/token`.
5. Server mencari package berdasarkan token.
6. Server cek package tidak hidden dan tidak locked.
7. Server cek apakah siswa punya attempt aktif.
8. Jika belum ada attempt aktif, server membuat attempt baru.
9. Server mengambil 110 soal acak dari bank soal package.
10. Server menyimpan urutan soal ke `Attempt.questionOrder`.
11. Server mengacak pilihan jawaban dan menyimpan ke `Attempt.choiceOrder`.
12. Siswa diarahkan ke halaman player ujian.
13. Player memanggil `GET /api/test/[id]/questions`.
14. Server mengirim soal sesuai urutan attempt, tanpa kunci jawaban.
15. Siswa menjawab soal.
16. Jawaban autosave ke `POST /api/ujian/response`.
17. Heartbeat mengupdate `Attempt.lastHeartbeatAt`.
18. Perpindahan tab/window dicatat ke `SecurityEvent`.
19. Submit final memanggil `POST /api/ujian/submit`.
20. Server menghitung nilai, menyimpan response final, dan mengisi `completedAt`.

### 6.2 Alur Admin Memantau Ujian

1. Admin login.
2. Admin membuka `/dashboard`.
3. Dashboard memanggil `GET /api/admin/analytics`.
4. API mengambil data attempt aktif, response, heartbeat, dan security event.
5. Admin membuka tab Monitoring.
6. Admin melihat peserta bermasalah terlebih dahulu.
7. Admin dapat search atau filter sesi.
8. Admin membuka log aktivitas untuk melihat event terbaru.

### 6.3 Alur Admin Membuat Paket dan Token

1. Admin membuka `/dashboard/[slug]`.
2. Admin membuat paket di `/dashboard/[slug]/create`.
3. API membuat `Package`, `Tag`, dan token awal.
4. Admin menambah soal di `/dashboard/[slug]/[id]`.
5. Admin dapat generate token baru dari kartu paket.
6. Siswa memakai token untuk membuka paket tersebut.

## 7. Daftar API Berdasarkan Modul

### Auth

- `GET/POST /api/auth/[...nextauth]`: NextAuth credentials dan Google OAuth.
- `POST /api/user`: register manual.

### Profile

- `GET /api/profile`: ambil profil user dan statistik ringkas.
- `POST /api/profile`: update profil user.
- `POST /api/profile/uploadprofile`: upload foto profil.

### Test dan Paket

- `GET /api/test`: daftar test.
- `GET /api/paket/[slug]`: daftar paket berdasarkan test.
- `POST /api/paket/create`: buat paket.
- `DELETE /api/paket/delete`: hapus paket.
- `GET /api/paket/info/[id]`: statistik paket untuk user.
- `PUT /api/paket/lock/[idpaket]`: lock/unlock paket.
- `PUT /api/paket/hide/[idpaket]`: hide/show paket.
- `PUT /api/paket/token/[id]`: generate token paket.

### Soal

- `GET /api/test/[id]/questions`: ambil soal paket.
- `POST /api/test/[id]/questions`: tambah soal.
- `DELETE /api/test/[id]/questions`: hapus soal.
- `GET /api/test/[id]/quiz`: ambil detail satu soal.
- `PUT /api/test/[id]/quiz`: update soal.
- `POST /api/pertanyaan/create/uploadimg/[quizId]`: upload gambar soal.

### Ujian CBT

- `POST /api/ujian/token`: akses ujian berdasarkan token.
- `POST /api/ujian/start/[id]`: mulai ujian dari modal paket.
- `GET /api/ujian/check`: ambil attempt aktif user.
- `GET /api/ujian/check/sesitest`: cek apakah user sedang dalam sesi test.
- `POST /api/ujian/heartbeat`: update terakhir aktif.
- `POST /api/ujian/pause`: simpan durasi offline/pause.
- `POST /api/ujian/response`: autosave jawaban.
- `POST /api/ujian/security-event`: catat aktivitas keluar tab/window.
- `POST /api/ujian/submit`: submit final dan hitung nilai.

### Hasil

- `GET /api/hasil/[id]`: detail hasil attempt.
- `GET /api/hasil/byuser`: riwayat attempt user.

### Admin

- `GET /api/admin/analytics`: dashboard, monitoring, analitik siswa, paket, soal.
- `GET /api/admin/export?type=attempts`: export attempt.
- `GET /api/admin/export?type=students`: export rekap siswa.
- `GET /api/admin/users`: daftar user.
- `PATCH /api/admin/users/[id]`: update user.
- `POST /api/admin/users/[id]/reset-password`: reset password.

## 8. Seed Data

File:

- `prisma/seed.js`

Isi seed saat ini:

- Admin: `admin@smarttaruna.test`, password `password123`.
- Siswa: `siswa@smarttaruna.test`, password `password123`.
- Paket SKD Token A: token `SKD-A-2026`, 240 soal.
- Paket SKD Token B: token `SKD-B-2026`, 240 soal.
- Paket TKP Token A: token `TKP-A-2026`, 240 soal.

Saat siswa mengerjakan, hanya 110 soal acak yang dipilih dari 240 soal paket.

## 9. Catatan Keamanan dan Batasan

Hal yang sudah aman:

- Kunci jawaban tidak dikirim ke siswa pada mode ujian.
- Autosave dan submit memvalidasi attempt milik user.
- Jawaban yang dikirim harus berasal dari question di package attempt.
- Admin-only route dilindungi middleware.
- Token mengontrol akses paket.
- Aktivitas keluar tab/window dicatat.

Hal yang perlu dipertimbangkan untuk produksi:

- Google OAuth harus memakai credential resmi dari Google Cloud Console.
- Token ujian sebaiknya memiliki masa berlaku bila diperlukan.
- Monitoring real-time bisa dibuat polling berkala atau WebSocket jika jumlah peserta besar.
- Untuk jumlah peserta sangat besar, API analytics sebaiknya diberi pagination server-side.
- Rate limiting login dan token access dapat ditambahkan.
- Audit log admin dapat ditambahkan untuk perubahan paket, token, dan user.

## 10. Kesimpulan Alur Data

Secara ringkas, aplikasi bekerja seperti ini:

1. User login sebagai siswa atau admin.
2. Admin membuat test, paket, token, dan soal.
3. Siswa memasukkan token di `/ujian`.
4. Token membuka package tertentu.
5. Server membuat attempt dan memilih 110 soal acak.
6. Siswa mengerjakan soal dengan autosave.
7. Server menyimpan jawaban dan memantau terakhir aktif.
8. Perpindahan tab/window dicatat sebagai security event.
9. Submit menghitung skor dan menyelesaikan attempt.
10. Admin melihat hasil, rekap, analitik individu, monitoring aktif, dan log aktivitas.
