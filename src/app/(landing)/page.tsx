"use client";

import {
  Analytics,
  ArrowForward,
  AssignmentTurnedIn,
  Key,
  ManageSearch,
  MonitorHeart,
  Security,
  Shuffle,
  Timer,
  VerifiedUser,
} from "@mui/icons-material";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const heroImage =
  "https://images.pexels.com/photos/5905702/pexels-photo-5905702.jpeg?auto=compress&cs=tinysrgb&w=2200";
const dashboardImage =
  "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1800";
const studyImage =
  "https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1800";

const stats = [
  { label: "Soal tampil per ujian", value: "110" },
  { label: "Kategori utama", value: "SKD & TPA" },
  { label: "Akses ujian", value: "Token" },
  { label: "Analitik admin", value: "Real-time" },
];

const features = [
  {
    icon: <Key fontSize="small" />,
    title: "Token paket ujian",
    text: "Admin dapat membuat token berbeda untuk setiap paket, sehingga sesi try out bisa dikendalikan sesuai jadwal.",
  },
  {
    icon: <Shuffle fontSize="small" />,
    title: "Randomisasi soal",
    text: "Sistem menyimpan urutan soal dan pilihan jawaban per sesi, sehingga hasil tetap bisa dicek meskipun urutan siswa berbeda.",
  },
  {
    icon: <Timer fontSize="small" />,
    title: "Timer dan auto-submit",
    text: "Waktu ujian mengikuti durasi paket. Saat waktu habis, jawaban yang tersimpan dapat dikumpulkan otomatis oleh server.",
  },
  {
    icon: <MonitorHeart fontSize="small" />,
    title: "Monitoring aktivitas",
    text: "Aktivitas keluar tab, kembali ke halaman ujian, dan status terakhir aktif tersedia untuk membantu pengawasan.",
  },
  {
    icon: <Analytics fontSize="small" />,
    title: "Analitik hasil",
    text: "Admin dapat membaca hasil siswa, performa paket, kualitas soal, dan risiko keamanan dari dashboard terpisah.",
  },
  {
    icon: <VerifiedUser fontSize="small" />,
    title: "Batas percobaan",
    text: "Setiap paket dapat diberi batas pengerjaan agar try out berjalan sesuai aturan yang ditetapkan.",
  },
];

const flows = [
  "Admin membuat paket SKD atau TPA",
  "Token dibagikan kepada siswa",
  "Siswa masuk ke halaman ujian",
  "Sistem menyimpan jawaban otomatis",
  "Hasil dan analitik dapat dipantau",
];

const analytics = [
  "Kualitas soal dan distraktor",
  "Rekap nilai per paket",
  "Analitik individu siswa",
  "Risiko aktivitas ujian",
];

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const primaryHref = session ? "/dashboard" : "/auth/sign-in";

  return (
    <div className="bg-white text-slate-950">
      <section id="beranda" className="relative overflow-hidden bg-slate-950">
        <Image
          src={heroImage}
          alt="Siswa belajar menggunakan laptop untuk persiapan try out CBT"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-[1680px] items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 2xl:px-14">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
              <Security fontSize="small" />
              Platform CBT untuk try out kedinasan
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl 2xl:text-7xl">
              Smart Taruna membantu try out berjalan tertib, terukur, dan mudah dipantau.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 lg:text-lg">
              Kelola paket SKD dan TPA, gunakan token ujian, acak urutan soal,
              pantau aktivitas siswa, dan lihat analitik hasil dalam satu sistem
              CBT yang siap untuk demo maupun operasional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push(primaryHref)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300"
              >
                {session ? "Buka Dashboard" : "Masuk dan Mulai"}
                <ArrowForward fontSize="small" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/ujian")}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                Buka Halaman Ujian
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="overflow-hidden rounded-2xl bg-white">
                <div className="relative h-52">
                  <Image
                    src={studyImage}
                    alt="Siswa mengikuti try out berbasis komputer"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-semibold text-cyan-100">Sesi Try Out Berbasis Token</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">SKD TO 1</h2>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">Token</p>
                      <p className="mt-2 font-mono text-xl font-bold tracking-wider text-slate-950">
                        SKD-A-2026
                      </p>
                    </div>
                    <div className="rounded-xl bg-cyan-50 p-4">
                      <p className="text-xs font-semibold uppercase text-cyan-700">Durasi</p>
                      <p className="mt-2 text-xl font-bold text-cyan-900">100 menit</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ["Randomisasi soal", "Urutan soal dan opsi disimpan per siswa"],
                      ["Jawaban otomatis tersimpan", "Data tetap tercatat selama sesi berjalan"],
                      ["Monitoring admin", "Aktivitas keluar tab dapat dipantau"],
                    ].map(([title, text]) => (
                      <div key={title} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-950">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="px-4 py-20 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Fitur utama</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 lg:text-5xl">
                Dibuat untuk alur CBT yang realistis dari admin sampai siswa.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 lg:text-base">
                Fokus Smart Taruna bukan hanya menampilkan soal, tetapi mengatur sesi,
                menyimpan jawaban, menjaga akses token, dan memberi data yang bisa
                dipakai admin untuk evaluasi.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 font-bold text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="alur" className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto grid max-w-[1680px] gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-200">
            <Image
              src={studyImage}
              alt="Peserta belajar dan mempersiapkan try out"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Alur kerja</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 lg:text-5xl">
              Sesi try out dibuat sederhana, tetapi tetap terkendali.
            </h2>
            <div className="mt-8 space-y-3">
              {flows.map((flow, index) => (
                <div key={flow} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{flow}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {index === 0 && "Paket bisa diatur berdasarkan urutan try out, durasi, batas percobaan, dan token."}
                      {index === 1 && "Token menjadi kunci akses agar siswa hanya masuk ke paket yang sedang dibuka."}
                      {index === 2 && "Siswa dapat melanjutkan sesi aktif tanpa memasukkan token ulang."}
                      {index === 3 && "Setiap jawaban disimpan berkala sehingga risiko kehilangan data lebih kecil."}
                      {index === 4 && "Admin membaca nilai, aktivitas, dan kualitas soal dari dashboard analitik."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="analitik" className="px-4 py-20 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto grid max-w-[1680px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 lg:grid-cols-2">
          <div className="p-6 text-white sm:p-10 lg:p-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
              <ManageSearch />
            </div>
            <h2 className="mt-6 text-3xl font-bold leading-tight lg:text-5xl">
              Admin tidak hanya melihat nilai, tetapi juga tahu bagian mana yang perlu diperbaiki.
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300 lg:text-base">
              Analitik dipisah menjadi siswa, paket, soal, dan keamanan agar halaman admin
              tetap ringan dibaca. Ini membantu admin mengambil keputusan tanpa harus
              menelusuri tabel panjang terus-menerus.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {analytics.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
                  <AssignmentTurnedIn fontSize="small" className="text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-[420px]">
            <Image
              src={dashboardImage}
              alt="Admin melihat analitik ujian di dashboard"
              fill
              className="object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-10 2xl:px-14">
        <div className="mx-auto flex max-w-[1680px] flex-col justify-between gap-6 rounded-3xl border border-slate-200 bg-cyan-50 p-6 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-cyan-800">Siap digunakan</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950 lg:text-4xl">
              Mulai kelola try out dengan alur CBT yang lebih rapi.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700">
              Gunakan dashboard untuk membuat paket, membuat token, memantau siswa,
              dan mengevaluasi kualitas soal setelah ujian berjalan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(primaryHref)}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {session ? "Buka Dashboard" : "Masuk Sekarang"}
            <ArrowForward fontSize="small" />
          </button>
        </div>
      </section>
    </div>
  );
}
