"use client";

import LoginIcon from "@mui/icons-material/Login";
import { Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  testName?: string;
  variant?: "compact" | "hero";
}

export const ExamTokenAccess = ({ testName, variant = "compact" }: Props) => {
  const router = useRouter();
  const [examToken, setExamToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const accessExam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (!examToken.trim()) {
      setMessage("Token ujian wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ujian/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examToken,
          testName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.testName && data.packageId) {
          router.push(`/ujian/${data.testName}/${data.packageId}`);
          return;
        }

        throw new Error(data.message || "Token ujian tidak valid.");
      }

      router.push(`/ujian/${data.testName}/${data.packageId}`);
    } catch (error: any) {
      setMessage(error.message || "Gagal mengakses ujian.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "hero") {
    return (
      <form
        onSubmit={accessExam}
        className="rounded-md border border-slate-200 bg-white p-5 shadow-sm md:p-7"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-100 text-teal-700">
            <LoginIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-700">Token Sesi CBT</p>
            <h2 className="text-xl font-bold text-slate-950">
              Masukkan token ujian
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor={testName ? `exam-token-${testName}` : "exam-token"}
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Token dari pengawas atau admin
          </label>
          <input
            id={testName ? `exam-token-${testName}` : "exam-token"}
            value={examToken}
            disabled={isLoading}
            onChange={(event) => setExamToken(event.target.value.toUpperCase())}
            className="h-14 w-full rounded-md border border-slate-300 bg-white px-4 text-lg font-bold text-slate-950 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:bg-slate-100"
            placeholder="SKD-A-2026"
          />
          {message && (
            <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          fullWidth
          className="mt-5 h-12"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <CircularProgress size={18} color="inherit" />
              Memvalidasi token
            </span>
          ) : (
            "Masuk ke Ujian"
          )}
        </Button>

        {isLoading && (
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-teal-600" />
          </div>
        )}
      </form>
    );
  }

  return (
    <form
      onSubmit={accessExam}
      className="mb-6 rounded-md border border-teal-100 bg-teal-50 px-5 py-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            htmlFor={testName ? `exam-token-${testName}` : "exam-token"}
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Akses ujian dengan token
          </label>
          <input
            id={testName ? `exam-token-${testName}` : "exam-token"}
            value={examToken}
            disabled={isLoading}
            onChange={(event) => setExamToken(event.target.value.toUpperCase())}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 disabled:bg-slate-100"
            placeholder="Contoh: SKD-A-2026"
          />
          {message && (
            <p className="mt-2 text-sm font-medium text-rose-600">{message}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          className="h-11"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <CircularProgress size={18} color="inherit" />
              Memvalidasi
            </span>
          ) : (
            "Masuk Ujian"
          )}
        </Button>
      </div>
    </form>
  );
};
