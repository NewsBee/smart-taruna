"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const registerImage =
  "https://images.pexels.com/photos/7777666/pexels-photo-7777666.jpeg?auto=compress&cs=tinysrgb&w=1400";

const RegistrationPage = () => {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [konfirmasiPassword, konfirmasi_password] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    setMsg("");

    if (!email || !password || !nama) {
      setMsg("Semua field harus diisi.");
      return false;
    }

    if (password !== konfirmasiPassword) {
      setMsg("Password dan konfirmasi password tidak cocok.");
      return false;
    }

    if (password.length < 8) {
      setMsg("Password harus memiliki minimal 8 karakter.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: nama,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/auth/sign-in");
      } else {
        throw new Error(data.message || "Terjadi kesalahan saat registrasi.");
      }
    } catch (error: any) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center px-5 py-10 md:px-10">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <PersonAddAltIcon />
              </div>
              <h1 className="mt-5 text-3xl font-bold text-slate-950">
                Buat akun Smart Taruna
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Daftar untuk mengikuti try out, menyimpan progres, dan melihat
                ringkasan hasil ujian setelah selesai.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <GoogleIcon fontSize="small" className="text-teal-600" />
                Daftar dengan Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                atau
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-slate-800">
                    Nama lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={nama}
                    onChange={(event) => setNama(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                      placeholder="Minimal 8 karakter"
                    />
                    <IconButton
                      aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                      onClick={() => setShowPassword((current) => !current)}
                      size="small"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Konfirmasi password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      value={konfirmasiPassword}
                      onChange={(event) => konfirmasi_password(event.target.value)}
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                      placeholder="Ulangi password"
                    />
                    <IconButton
                      aria-label={
                        showConfirmPassword
                          ? "Sembunyikan konfirmasi password"
                          : "Lihat konfirmasi password"
                      }
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      size="small"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </div>
                </div>

                {msg && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {msg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-teal-600 px-5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:bg-slate-400"
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Buat Akun"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Sudah punya akun?{" "}
                <a
                  className="font-bold text-teal-700 hover:text-teal-800"
                  href="/auth/sign-in"
                >
                  Masuk
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <Image
            src={registerImage}
            alt="Siswa baru Smart Taruna siap mengikuti try out"
            fill
            priority
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-950/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-wide text-teal-200">
                Mulai dari akun siswa
              </p>
              <h2 className="mt-4 text-5xl font-bold leading-tight">
                Semua riwayat try out tersimpan rapi di satu profil.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-200">
                Akun siswa dipakai untuk mengakses token ujian, menyimpan
                jawaban secara otomatis, dan membaca hasil per kategori soal.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default RegistrationPage;
