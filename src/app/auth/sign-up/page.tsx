"use client";

import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const RegistrationPage = () => {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [konfirmasiPassword, konfirmasi_password] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (password !== konfirmasiPassword) {
      setMsg("Password dan konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: nama,
        email: email,
        password: password,
      }),
    });

    if (res.ok) {
      router.push("/auth/sign-in");
    } else {
      console.error("Registration Failed");
    }

    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden h-screen">
      {/* <!-- Hero --> */}
      <div className="mx-auto max-w-screen-md py-9 px-4 sm:px-6 md:max-w-screen-xl  md:px-8 h-screen ">
        <div className="hidden md:block md:absolute md:top-0 md:start-1/2 md:end-0 h-screen bg-[url('https://images.unsplash.com/photo-1700190827495-f9d8eec1a08c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-no-repeat bg-center bg-cover"></div>
        <Box
          sx={{
            mr: 1,
            // backgroundColor: "primary.main",
            borderRadius: "",
            height: 50,
            width: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            "& svg": {
              fontSize: 40,
            },
          }}
        >
          <button onClick={() => router.push("/")}>
            <ArrowBackIcon />
          </button>
        </Box>
        <div className=" md:w-1/2 xl:pe-0 xl:w-5/12">
          {/* <!-- Title --> */}
          <h1 className="text-4xl text-gray-800 font-bold md:text-4xl md:leading-tight  lg:text-4xl    lg:leading-tight dark:text-gray-800">
            Daftar{" "}
            <Typography
              component="mark"
              sx={{
                position: "relative",
                color: "primary.main",
                fontSize: "inherit",
                fontWeight: "inherit",
                backgroundColor: "unset",
              }}
            >
              Smart Taruna <br />
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: -20, md: -20 },
                  transform: "rotate(6deg)",
                  left: 2,
                  "& img": {
                    width: { xs: 140, md: 175 },
                    mx: "auto",
                    height: "auto",
                  },
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/headline-curve.svg" alt="Headline curve" />
              </Box>
            </Typography>
            <span className="text-black dark:text-secondary">Sekarang</span>
          </h1>
          <p className="mt-3 text-base leading-6 text-gray-500">
            {" "}
            Bergabunglah dengan kami untuk memperdalam pengetahuan bisnis umkm
            anda!
          </p>

          {/* <!-- End Title --> */}

          {/* <!-- Form --> */}
          <form className="" onSubmit={handleSubmit}>
            <div className="mb-4 mt-4">
              <label
                htmlFor="hs-hero-name-2 nama"
                className="block text-sm font-medium dark:text-white"
              >
                <span className="sr-only">Nama Lengkap</span>
              </label>
              <input
                type="text"
                id="hs-hero-name-2"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none"
                placeholder="Nama Lengkap"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="hs-hero-email-2"
                className="block text-sm font-medium dark:text-white"
              >
                <span className="sr-only">Email address</span>
              </label>
              <input
                type="email"
                id="hs-hero-name-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none"
                placeholder="Email"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="hs-hero-password-2"
                className="block text-sm font-medium dark:text-white"
              >
                <span className="sr-only">Password</span>
              </label>
              <input
                type="password"
                id="hs-hero-name-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none"
                placeholder="Password"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="hs-hero-password-2"
                className="block text-sm font-medium dark:text-white"
              >
                <span className="sr-only">Konfirmasi Password</span>
              </label>
              <input
                type="password"
                id="hs-hero-name-2"
                value={konfirmasiPassword}
                onChange={(e) => konfirmasi_password(e.target.value)}
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm  focus:ring focus:ring-blue-500 outline-none disabled:opacity-50 disabled:pointer-events-none"
                placeholder="Konfirmasi Password"
              />
            </div>
            <p className=" m-2 text-sm text-gray-900 font-poppins">
              Sudah punya akun?{" "}
              <a
                className="text-[#00ADB5] decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                href="/auth/sign-in"
              >
                Masuk{" "}
              </a>
            </p>
            {msg && (
              <p className="text-red-600 text-sm font-semibold font-poppins text-center mb-2">
                {msg}
              </p>
            )}
            <div className="grid">
              <button
                type="submit"
                className="py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-[#FFAF35] text-white hover:bg-[#00ADB5] disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                {loading ? ( // Menampilkan animasi loading jika loading aktif
                  <CircularProgress size={24} color="primary" />
                ) : (
                  "Buat Akun"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
