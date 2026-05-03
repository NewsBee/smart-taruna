"use client";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import KeyIcon from "@mui/icons-material/Key";
import SecurityIcon from "@mui/icons-material/Security";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import TimerIcon from "@mui/icons-material/Timer";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: <KeyIcon fontSize="small" />,
    title: "Token sesi ujian",
    text: "Siswa membuka paket berdasarkan token aktif yang dibuat admin.",
  },
  {
    icon: <ShuffleIcon fontSize="small" />,
    title: "Randomisasi soal",
    text: "Setiap sesi ujian memiliki urutan soal dan pilihan jawaban yang tersimpan khusus.",
  },
  {
    icon: <SecurityIcon fontSize="small" />,
    title: "Monitoring aktivitas",
    text: "Perpindahan tab, fokus window, dan aktivitas terakhir tercatat untuk admin.",
  },
  {
    icon: <TimerIcon fontSize="small" />,
    title: "Pengumpulan otomatis",
    text: "Jawaban yang sudah tersimpan dapat dikumpulkan otomatis saat waktu ujian habis.",
  },
];

const stats = [
  { label: "Soal ditampilkan", value: "110" },
  { label: "Jenis try out", value: "SKD & TPA" },
  { label: "Materi SKD", value: "TWK TIU TKP" },
  { label: "Mode akses", value: "Token" },
];

const heroImage =
  "https://images.pexels.com/photos/7777667/pexels-photo-7777667.jpeg?auto=compress&cs=tinysrgb&w=1800";
const analyticsImage =
  "https://images.pexels.com/photos/7777664/pexels-photo-7777664.jpeg?auto=compress&cs=tinysrgb&w=1400";

export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const primaryHref = session ? "/dashboard" : "/auth/sign-in";

  return (
    <div className="bg-white text-slate-950">
      <section className="relative min-h-[calc(100vh-92px)] overflow-hidden rounded-b-[28px] bg-slate-950">
        <Image
          src={heroImage}
          alt="Siswa Smart Taruna belajar untuk persiapan try out CBT"
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />

        <div className="relative z-10 flex min-h-[calc(100vh-92px)] flex-col justify-between px-5 py-10 md:px-10 lg:px-14">
          <div className="max-w-3xl pt-8 md:pt-16">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
              Platform CBT untuk try out kedinasan
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
              Smart Taruna CBT yang siap untuk ujian berbasis token.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
              Siapkan try out SKD dan TPA dengan token ujian, urutan soal
              acak, batas waktu, pemantauan aktivitas, nilai batas kelulusan,
              dan rekap hasil siswa dalam satu sistem.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push(primaryHref)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 text-sm font-bold text-white shadow-lg shadow-teal-950/30 transition hover:bg-teal-400"
              >
                {session ? "Masuk Dashboard" : "Mulai Try Out"}
                <ArrowForwardIcon fontSize="small" />
              </button>
              {!session && (
                <button
                  type="button"
                  onClick={() => router.push("/auth/sign-up")}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Buat Akun
                </button>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="feature" className="px-5 py-16 md:px-10 lg:px-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
              Fitur utama
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
              Dibangun untuk alur CBT yang rapi dari admin sampai siswa.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Admin dapat menyiapkan paket try out, membagikan token ujian, dan
              memantau pengerjaan siswa. Siswa cukup masuk, memasukkan token,
              mengerjakan soal, lalu melihat hasil dan pembahasan.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-bold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 md:px-10 lg:px-14">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:grid-cols-2">
          <div className="p-6 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
              <AnalyticsIcon />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">
              Admin mendapatkan rekap nilai dan analitik yang mudah dibaca.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Pantau sesi ujian yang sedang berjalan, lihat hasil tiap siswa,
              filter berdasarkan paket, dan cek performa per kategori soal.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Nilai batas kelulusan", "Riwayat pengerjaan", "Aktivitas siswa", "Rekap nilai"].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                  >
                    <AssignmentTurnedInIcon fontSize="small" className="text-teal-600" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="relative min-h-[320px]">
            <Image
              src={analyticsImage}
              alt="Siswa Smart Taruna melihat hasil belajar dan analitik try out"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
