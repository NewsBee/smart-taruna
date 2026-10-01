"use client";

import GoogleIcon from "@mui/icons-material/Google";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";

type GoogleSignInButtonProps = {
  label: string;
};

export default function GoogleSignInButton({ label }: GoogleSignInButtonProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProviders()
      .then((providers) => setAvailable(Boolean(providers?.google)))
      .catch(() => setAvailable(false));
  }, []);

  const handleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const providers = await getProviders();
      if (!providers?.google) {
        setAvailable(false);
        setError("Login Google belum dikonfigurasi di server.");
        setLoading(false);
        return;
      }

      await signIn("google", { callbackUrl: "/ujian" });
    } catch {
      setError("Tidak dapat memulai login Google. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={available === false || loading}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon fontSize="small" className="text-teal-600" />
        {loading ? "Menghubungkan..." : label}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      {available === false && !error && (
        <p className="mt-2 text-sm text-slate-500">
          Login Google belum dikonfigurasi di server.
        </p>
      )}
    </div>
  );
}
