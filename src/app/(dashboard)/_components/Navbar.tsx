"use client";

import {
  AccountCircle,
  Analytics,
  Assignment,
  Close,
  Dashboard,
  ExitToApp,
  History,
  Menu as MenuIcon,
  People,
  Person,
  PlayCircle,
} from "@mui/icons-material";
import {
  Avatar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  studentOnly?: boolean;
  match?: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Dashboard fontSize="small" />,
    adminOnly: true,
    match: (pathname) =>
      pathname === "/dashboard" || pathname.startsWith("/dashboard/analytics"),
  },
  {
    label: "Paket SKD",
    href: "/dashboard/SKD",
    icon: <Assignment fontSize="small" />,
    adminOnly: true,
    match: (pathname) => pathname.startsWith("/dashboard/SKD"),
  },
  {
    label: "Paket TPA",
    href: "/dashboard/TPA",
    icon: <Analytics fontSize="small" />,
    adminOnly: true,
    match: (pathname) => pathname.startsWith("/dashboard/TPA"),
  },
  {
    label: "Ujian",
    href: "/ujian",
    icon: <PlayCircle fontSize="small" />,
    studentOnly: true,
    match: (pathname) => pathname.startsWith("/ujian"),
  },
  {
    label: "Riwayat",
    href: "/history",
    icon: <History fontSize="small" />,
    studentOnly: true,
    match: (pathname) => pathname.startsWith("/history") || pathname.startsWith("/hasil"),
  },
  {
    label: "Pengguna",
    href: "/dashboard/users",
    icon: <People fontSize="small" />,
    adminOnly: true,
    match: (pathname) => pathname.startsWith("/dashboard/users"),
  },
];

export const NavBar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatar, setAvatar] = useState("");
  const isAdmin = session?.user?.role === "admin";
  const open = Boolean(anchorEl);

  const visibleItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.studentOnly && isAdmin) return false;
        return true;
      }),
    [isAdmin]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) return;

        const data = await response.json();
        setAvatar(data.userProfile?.avatar || data.avatar || "");
      } catch {
        setAvatar("");
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const closeMenu = () => setAnchorEl(null);

  const handleLogout = async () => {
    await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image src="/images/logo.png" alt="Smart Taruna" fill className="object-cover" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-base font-bold leading-5 text-slate-950">
              Smart Taruna
            </span>
            <span className="block truncate text-xs font-medium text-slate-500">
              {isAdmin ? "Panel Admin CBT" : "Panel Siswa CBT"}
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {visibleItems.map((item) => {
            const active = item.match?.(pathname) || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 lg:hidden"
            aria-label="Buka menu"
          >
            {mobileOpen ? <Close /> : <MenuIcon />}
          </button>

          <button
            type="button"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-2 transition hover:bg-slate-50"
          >
            <Avatar
              src={avatar}
              alt={session?.user?.name || session?.user?.email || "Profil"}
              sx={{ width: 36, height: 36 }}
            />
            <span className="hidden max-w-[160px] text-left md:block">
              <span className="block truncate text-sm font-bold text-slate-950">
                {session?.user?.name || session?.user?.email || "Pengguna"}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {isAdmin ? "Admin" : "Siswa"}
              </span>
            </span>
          </button>

          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                width: 230,
                mt: 1,
                borderRadius: "12px",
                padding: "8px",
                boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                router.push("/profile");
                closeMenu();
              }}
              sx={{ borderRadius: "8px", padding: "10px 12px" }}
            >
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Profil Saya</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                router.push("/profile");
                closeMenu();
              }}
              sx={{ borderRadius: "8px", padding: "10px 12px" }}
            >
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Pengaturan Akun</Typography>
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem
              onClick={handleLogout}
              sx={{ borderRadius: "8px", padding: "10px 12px", color: "#be123c" }}
            >
              <ListItemIcon>
                <ExitToApp fontSize="small" sx={{ color: "#be123c" }} />
              </ListItemIcon>
              <Typography variant="inherit">Keluar</Typography>
            </MenuItem>
          </Menu>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-xl lg:hidden">
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleItems.map((item) => {
              const active = item.match?.(pathname) || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${
                    active
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
