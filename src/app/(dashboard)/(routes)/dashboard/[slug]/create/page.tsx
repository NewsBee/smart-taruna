"use client"

import { QuizForm } from "@/app/(dashboard)/_components/forms/QuizForm";
import { useCreatePaket } from "@/app/(dashboard)/shared/queries";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyIcon from "@mui/icons-material/Key";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import RepeatIcon from "@mui/icons-material/Repeat";
import TimerIcon from "@mui/icons-material/Timer";
import ViewTimelineIcon from "@mui/icons-material/ViewTimeline";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

interface Props {
    params: {
      slug: string;
    };
  }

const CreateQuiz: React.FC<Props> = ({ params }) => {
  const { mutateAsync, reset } = useCreatePaket();
  const testName = params.slug
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${testName}`)}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali ke paket {testName.toUpperCase()}
            </button>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Paket Baru
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Buat Paket {testName.toUpperCase()}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Siapkan paket CBT lengkap dengan urutan try out, token sesi,
              durasi pengerjaan, dan tag agar analitik admin tersusun rapi.
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={() => router.push(`/dashboard/${testName}`)}
          >
            Lihat Paket
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-500">
                Detail paket
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Informasi utama CBT
              </h2>
            </div>
            <QuizForm
              redirect={`/dashboard/${testName}`}
              mutateAsync={mutateAsync}
              reset={reset}
              testname={testName}
            />
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-teal-700">
                <PlaylistAddCheckIcon />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950">
                Alur paket yang benar
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Satu paket dianggap satu try out. Pastikan urutan TO, token,
                dan durasi sudah benar sebelum siswa mulai mengerjakan.
              </p>
            </div>

            {[
              {
                icon: <ViewTimelineIcon fontSize="small" />,
                title: "Urutan TO",
                text: "Dipakai dashboard admin untuk menampilkan TO 1, TO 2, dan seterusnya.",
              },
              {
                icon: <KeyIcon fontSize="small" />,
                title: "Token ujian",
                text: "Siswa membuka paket berdasarkan token. Token harus unik untuk tiap paket.",
              },
              {
                icon: <TimerIcon fontSize="small" />,
                title: "Durasi pengerjaan",
                text: "Timer ujian mengikuti durasi paket sejak sesi ujian dimulai.",
              },
              {
                icon: <RepeatIcon fontSize="small" />,
                title: "Batas percobaan",
                text: "Menentukan berapa kali siswa boleh membuka dan menyelesaikan paket yang sama.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CreateQuiz;
