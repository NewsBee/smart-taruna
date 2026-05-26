"use client";

import { Close, Menu } from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { FC, useState } from "react";

const landingMenus = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Alur CBT", href: "#alur" },
  { label: "Analitik", href: "#analitik" },
];

const Header: FC = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const goTo = (href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center justify-between px-4 sm:px-6 lg:px-10 2xl:px-14">
        <button
          type="button"
          onClick={() => goTo("#beranda")}
          className="flex items-center gap-3"
          aria-label="Smart Taruna"
        >
          <span className="relative h-11 w-11 overflow-hidden rounded-xl bg-slate-100">
            <Image src="/images/logo.png" alt="Smart Taruna" fill className="object-cover" />
          </span>
          <span className="text-left">
            <span className="block text-base font-bold leading-5 text-slate-950">
              Smart Taruna
            </span>
            <span className="block text-xs font-medium text-slate-500">CBT Platform</span>
          </span>
        </button>

        <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-2 lg:flex">
          {landingMenus.map((menu) => (
            <button
              key={menu.href}
              type="button"
              onClick={() => goTo(menu.href)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              {menu.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Buka Dashboard
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push("/auth/sign-in")}
                className="h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => router.push("/auth/sign-up")}
                className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Daftar
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 lg:hidden"
          aria-label="Buka menu"
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="space-y-2">
            {landingMenus.map((menu) => (
              <button
                key={menu.href}
                type="button"
                onClick={() => goTo(menu.href)}
                className="block w-full rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {menu.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {session ? (
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="col-span-2 h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white"
              >
                Buka Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/auth/sign-in")}
                  className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-700"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/auth/sign-up")}
                  className="h-11 rounded-lg bg-slate-950 px-5 text-sm font-bold text-white"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
