"use client";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { IconButton } from "@mui/material";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginImage =
  "https://images.pexels.com/photos/7777672/pexels-photo-7777672.jpeg?auto=compress&cs=tinysrgb&w=1400";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.ok) {
      router.push("/dashboard");
      return;
    }

    setError("Email atau password tidak sesuai.");
    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <Image
            src={loginImage}
            alt="Siswa Smart Taruna bersiap mengikuti try out CBT"
            fill
            priority
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-teal-950/50" />
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/15"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali
            </button>
            <div className="max-w-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500 text-white">
                <ShieldOutlinedIcon />
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Masuk ke ruang CBT Smart Taruna.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-200">
                Lanjutkan ujian yang sedang berjalan, cek hasil try out, atau
                kelola paket ujian sesuai jenis akun Anda.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Token ujian", "Simpan otomatis", "Analitik"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/15 bg-white/10 p-4 font-semibold backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 md:px-10">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700 lg:hidden"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
                  Masuk akun
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">
                  Selamat datang kembali
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Masuk untuk membuka dashboard, halaman ujian, riwayat try out,
                  dan profil belajar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <GoogleIcon fontSize="small" className="text-teal-600" />
                Masuk dengan Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                atau
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-slate-800">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="nama@email.com"
                    required
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
                      name="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 pr-12 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                      placeholder="Masukkan password"
                      required
                    />
                    <IconButton
                      aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                      size="small"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-teal-600 px-5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:bg-slate-400"
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Belum punya akun?{" "}
                <a
                  className="font-bold text-teal-700 hover:text-teal-800"
                  href="/auth/sign-up"
                >
                  Daftar sekarang
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
