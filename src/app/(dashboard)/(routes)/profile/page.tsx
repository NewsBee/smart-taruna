"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertColor,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Modal,
  Snackbar,
  TextField,
} from "@mui/material";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocalActivityRoundedIcon from "@mui/icons-material/LocalActivityRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type ProfileSummary = {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  latestScore: number | null;
  completionRate: number;
  totalSecurityEvents: number;
  bestPackage: string;
};

type PerTestStat = {
  testName: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  latestScore: number | null;
};

type TrendItem = {
  name: string;
  packageTitle: string;
  testName: string;
  score: number;
  averageResponseScore: number;
};

type RecentAttempt = {
  id: number;
  packageTitle: string;
  testName: string;
  score: number | null;
  status: string;
  answeredCount: number;
  questionCount: number;
  securityEventCount: number;
  createdAt: string;
  completedAt: string;
};

type AdminSummary = {
  students: number;
  packages: number;
  questions: number;
  totalAttempts: number;
  activeAttempts: number;
};

interface ProfileType {
  role: string;
  avatar: string | null;
  username: string;
  email: string;
  phoneNumber: string;
  lastEducation: string;
  major: string;
  destinationInstitution: string;
  summary: ProfileSummary;
  perTestStats: PerTestStat[];
  trend: TrendItem[];
  recentAttempts: RecentAttempt[];
  analysis: {
    headline: string;
    focus: string;
    discipline: string;
    consistency: string;
  };
  adminSummary: AdminSummary | null;
}

const emptyProfile: ProfileType = {
  role: "siswa",
  avatar: null,
  username: "",
  email: "",
  phoneNumber: "",
  lastEducation: "",
  major: "",
  destinationInstitution: "",
  summary: {
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    latestScore: null,
    completionRate: 0,
    totalSecurityEvents: 0,
    bestPackage: "-",
  },
  perTestStats: [],
  trend: [],
  recentAttempts: [],
  analysis: {
    headline: "",
    focus: "",
    discipline: "",
    consistency: "",
  },
  adminSummary: null,
};

const infoFallback = (value?: string | null) => value || "Belum diisi";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ST";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const StatCard = ({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{helper}</p>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
    {text}
  </div>
);

const editProfileButtonSx = {
  minHeight: 42,
  borderRadius: "8px",
  "--mui-contained-bg": "#ffffff",
  "--mui-contained-hover-bg": "#e2e8f0",
  "--mui-contained-active-bg": "#cbd5e1",
  "--mui-contained-color": "#0f172a",
  backgroundColor: "#ffffff",
  color: "#0f172a",
  border: "1px solid rgba(255,255,255,0.7)",
  textTransform: "none",
  boxShadow: "none",
  fontWeight: 700,
  "&:hover": {
    backgroundColor: "#e2e8f0",
    boxShadow: "none",
  },
  "&:active": {
    backgroundColor: "#cbd5e1",
    boxShadow: "none",
  },
  "&:focus-visible": {
    outline: "3px solid rgba(255,255,255,0.35)",
    outlineOffset: "2px",
  },
};

const primaryActionButtonSx = {
  minHeight: 42,
  borderRadius: "8px",
  "--mui-contained-bg": "#0f172a",
  "--mui-contained-hover-bg": "#1e293b",
  "--mui-contained-active-bg": "#020617",
  "--mui-contained-disabled-bg": "#334155",
  "--mui-contained-disabled-color": "#e2e8f0",
  "--mui-contained-color": "#ffffff",
  backgroundColor: "#0f172a",
  color: "#ffffff",
  textTransform: "none",
  boxShadow: "none",
  fontWeight: 700,
  "&:hover": {
    backgroundColor: "#1e293b",
    boxShadow: "none",
  },
  "&:active": {
    backgroundColor: "#020617",
    boxShadow: "none",
  },
  "&.Mui-disabled": {
    backgroundColor: "#334155",
    color: "#e2e8f0",
    opacity: 1,
  },
};

const UserProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editedProfile, setEditedProfile] = useState<ProfileType>(emptyProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadProfile = useCallback(async () => {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (!response.ok) throw new Error("Gagal mengambil data profil");
    const data = await response.json();
    setProfile(data.userProfile);
    setEditedProfile({ ...emptyProfile, ...data.userProfile });
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await loadProfile();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || "Gagal mengambil data profil.",
          severity: "error",
        });
      }
    };

    fetchProfile();
  }, [loadProfile]);

  const chartData = useMemo(() => profile?.trend || [], [profile]);
  const testChartData = useMemo(() => profile?.perTestStats || [], [profile]);
  const adminSystemData = useMemo(() => {
    const summary = profile?.adminSummary;
    if (!summary) return [];

    return [
      { name: "Siswa", value: summary.students },
      { name: "Paket", value: summary.packages },
      { name: "Bank soal", value: summary.questions },
      { name: "Sesi ujian", value: summary.totalAttempts },
      { name: "Sesi aktif", value: summary.activeAttempts },
    ];
  }, [profile]);

  const handleSaveChanges = async () => {
    if (!editedProfile) return;
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui profil");
      }

      await loadProfile();
      setIsEditModalOpen(false);
      setSnackbar({
        open: true,
        message: "Profil berhasil diperbarui.",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Gagal memperbarui profil.",
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditedProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Ukuran file terlalu besar. Maksimum 5MB.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setIsUploading(true);

    try {
      const response = await fetch("/api/profile/uploadprofile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal mengganti foto profil");

      const data = await response.json();
      setProfile((current) =>
        current ? { ...current, avatar: data.path } : current
      );
      setEditedProfile((current) => ({ ...current, avatar: data.path }));
      setSnackbar({
        open: true,
        message: "Foto profil berhasil diperbarui.",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Gagal mengganti foto profil.",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleClearProfileImage = async () => {
    setIsUploading(true);

    try {
      const response = await fetch("/api/profile/uploadprofile", {
        method: "DELETE",
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus foto profil");
      }

      setProfile((current) => (current ? { ...current, avatar: null } : current));
      setEditedProfile((current) => ({ ...current, avatar: null }));
      setSnackbar({
        open: true,
        message: "Foto profil berhasil dikosongkan.",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Gagal menghapus foto profil.",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <CircularProgress size={28} />
          <p className="mt-4 text-sm text-slate-500">Memuat profil dan analitik...</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-950 px-5 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 shrink-0">
                  <Avatar
                    src={profile.avatar || undefined}
                    alt={profile.username}
                    sx={{
                      width: 112,
                      height: 112,
                      bgcolor: "#334155",
                      fontSize: 32,
                      fontWeight: 700,
                      border: "4px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    {getInitials(profile.username)}
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white text-slate-900 shadow-md transition hover:bg-slate-100"
                    title="Ganti foto profil"
                  >
                    {isUploading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <CameraAltRoundedIcon fontSize="small" />
                    )}
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-200">
                      {isAdmin ? "Admin" : "Siswa"}
                    </span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-100">
                      Akun aktif
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                    {profile.username}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-2">
                      <EmailRoundedIcon fontSize="small" />
                      {profile.email}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <SchoolRoundedIcon fontSize="small" />
                      {isAdmin
                        ? "Administrator sistem CBT"
                        : infoFallback(profile.destinationInstitution)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {profile.avatar && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleClearProfileImage}
                    disabled={isUploading}
                    sx={{
                      minHeight: 42,
                      borderRadius: "8px",
                      borderColor: "rgba(255,255,255,0.35)",
                      color: "#ffffff",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: "rgba(255,255,255,0.6)",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    }}
                  >
                    Hapus foto
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => {
                    setEditedProfile({ ...emptyProfile, ...profile });
                    setIsEditModalOpen(true);
                  }}
                  sx={editProfileButtonSx}
                >
                  Edit profil
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
            {isAdmin && profile.adminSummary ? (
              <>
                <StatCard
                  label="Total siswa"
                  value={profile.adminSummary.students}
                  helper="Akun siswa yang terdaftar"
                  icon={<ManageAccountsRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Paket ujian"
                  value={profile.adminSummary.packages}
                  helper="Paket CBT yang tersedia"
                  icon={<QuizRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Bank soal"
                  value={profile.adminSummary.questions}
                  helper="Soal tersimpan di database"
                  icon={<VerifiedUserRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Sesi aktif"
                  value={profile.adminSummary.activeAttempts}
                  helper={`${profile.adminSummary.totalAttempts} total sesi ujian tercatat`}
                  icon={<LocalActivityRoundedIcon fontSize="small" />}
                />
              </>
            ) : (
              <>
                <StatCard
                  label="Try out selesai"
                  value={profile.summary.completedAttempts}
                  helper={`${profile.summary.totalAttempts} sesi pernah dimulai`}
                  icon={<LocalActivityRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Rata-rata nilai"
                  value={profile.summary.averageScore}
                  helper={`Nilai terakhir: ${profile.summary.latestScore ?? "-"}`}
                  icon={<TrendingUpRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Nilai tertinggi"
                  value={profile.summary.highestScore}
                  helper={profile.summary.bestPackage}
                  icon={<VerifiedUserRoundedIcon fontSize="small" />}
                />
                <StatCard
                  label="Kedisiplinan ujian"
                  value={
                    profile.summary.totalSecurityEvents
                      ? `${profile.summary.totalSecurityEvents} catatan`
                      : "Aman"
                  }
                  helper={`${profile.summary.completionRate}% sesi diselesaikan`}
                  icon={<WarningAmberRoundedIcon fontSize="small" />}
                />
              </>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">Data diri</p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Informasi akun
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ["Nama", profile.username],
                ["Email", profile.email],
                ["Nomor telepon", infoFallback(profile.phoneNumber)],
                ["Pendidikan terakhir", infoFallback(profile.lastEducation)],
                ["Jurusan", infoFallback(profile.major)],
                ["Institusi tujuan", infoFallback(profile.destinationInstitution)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {isAdmin ? "Panel admin" : "Analisa siswa"}
                </p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {isAdmin ? "Prioritas pengelolaan CBT" : "Rekomendasi belajar"}
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {isAdmin ? "Kontrol operasional" : "Berdasarkan data try out"}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(isAdmin
                ? [
                    [
                      "Monitoring ujian",
                      `${profile.adminSummary?.activeAttempts ?? 0} sesi sedang aktif. Pantau aktivitas peserta dari dashboard admin.`,
                    ],
                    [
                      "Pengelolaan siswa",
                      `${profile.adminSummary?.students ?? 0} siswa terdaftar. Gunakan manajemen user untuk memperbarui data dan reset password.`,
                    ],
                    [
                      "Kesiapan paket",
                      `${profile.adminSummary?.packages ?? 0} paket dan ${profile.adminSummary?.questions ?? 0} soal tersedia untuk CBT.`,
                    ],
                    [
                      "Rekap nilai",
                      `${profile.adminSummary?.totalAttempts ?? 0} sesi ujian tercatat. Gunakan rekap admin untuk melihat hasil dan analitik individu.`,
                    ],
                  ]
                : [
                    ["Ringkasan", profile.analysis.headline],
                    ["Fokus latihan", profile.analysis.focus],
                    ["Disiplin ujian", profile.analysis.discipline],
                    ["Konsistensi", profile.analysis.consistency],
                  ]
              ).map(([title, content]) => (
                <div
                  key={title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {isAdmin ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Komposisi sistem</p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Data operasional CBT
                </h2>
              </div>
              <div className="mt-6 h-[320px]">
                {adminSystemData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adminSystemData} margin={{ left: 0, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name="Jumlah"
                        fill="#334155"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Data operasional admin belum tersedia." />
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Akses cepat</p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Menu pengelolaan
                </h2>
              </div>
              <div className="mt-6 grid gap-3">
                {[
                  {
                    title: "Dashboard utama",
                    description: "Lihat rekap nilai, monitoring aktivitas, dan analitik siswa.",
                    action: "Buka dashboard",
                    href: "/dashboard",
                    icon: <DashboardRoundedIcon fontSize="small" />,
                  },
                  {
                    title: "Manajemen user",
                    description: "Kelola akun siswa, data profil, dan reset password.",
                    action: "Kelola user",
                    href: "/dashboard/users",
                    icon: <ManageAccountsRoundedIcon fontSize="small" />,
                  },
                  {
                    title: "Paket SKD",
                    description: "Generate token, atur paket, dan kelola soal SKD.",
                    action: "Kelola SKD",
                    href: "/dashboard/SKD",
                    icon: <QuizRoundedIcon fontSize="small" />,
                  },
                  {
                    title: "Paket TPA",
                    description: "Kelola paket TPA untuk latihan potensi akademik.",
                    action: "Kelola TPA",
                    href: "/dashboard/TPA",
                    icon: <VerifiedUserRoundedIcon fontSize="small" />,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outlined"
                      onClick={() => router.push(item.href)}
                      sx={{ textTransform: "none", whiteSpace: "nowrap" }}
                    >
                      {item.action}
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Grafik nilai</p>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    Perkembangan try out
                  </h2>
                </div>
              </div>
              <div className="mt-6 h-[320px]">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 0, right: 12 }}>
                      <defs>
                        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        name="Nilai"
                        stroke="#0f172a"
                        strokeWidth={3}
                        fill="url(#scoreFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Belum ada grafik nilai. Selesaikan try out pertama untuk melihat perkembangan." />
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Per kategori</p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Rata-rata test
                </h2>
              </div>
              <div className="mt-6 h-[320px]">
                {testChartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={testChartData} margin={{ left: 0, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="testName" stroke="#64748b" tickLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Bar
                        dataKey="averageScore"
                        name="Rata-rata"
                        fill="#334155"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Belum ada data kategori yang bisa dibandingkan." />
                )}
              </div>
            </section>
          </div>
        )}

        {!isAdmin && (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-end sm:justify-between lg:p-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Riwayat</p>
              <h2 className="text-2xl font-semibold text-slate-950">
                Hasil try out terbaru
              </h2>
            </div>
            <Button
              variant="outlined"
              onClick={() => router.push("/history")}
              sx={{ textTransform: "none" }}
            >
              Lihat semua riwayat
            </Button>
          </div>

          {profile.recentAttempts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Paket</th>
                    <th className="px-5 py-3 font-semibold">Kategori</th>
                    <th className="px-5 py-3 font-semibold">Nilai</th>
                    <th className="px-5 py-3 font-semibold">Jawaban</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Catatan</th>
                    <th className="px-5 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {profile.recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-950">
                        {attempt.packageTitle}
                        <p className="mt-1 text-xs font-normal text-slate-500">
                          Mulai {attempt.createdAt}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{attempt.testName}</td>
                      <td className="px-5 py-4 text-slate-950">
                        {attempt.score ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {attempt.answeredCount}/{attempt.questionCount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            attempt.status === "Selesai"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {attempt.securityEventCount
                          ? `${attempt.securityEventCount} aktivitas`
                          : "Aman"}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => router.push(`/hasil/${attempt.id}`)}
                          sx={{ textTransform: "none" }}
                        >
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 lg:p-6">
              <EmptyState text="Belum ada riwayat try out. Masukkan token ujian dari halaman ujian untuk memulai paket pertama." />
            </div>
          )}
          </section>
        )}
      </div>

      <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(92vw, 560px)",
            maxHeight: "88vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
          }}
        >
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-xl font-semibold text-slate-950">Edit profil</h3>
            <p className="mt-1 text-sm text-slate-500">
              Perbarui data akun agar informasi profil tetap akurat.
            </p>
          </div>
          <div className="space-y-4 px-6 py-5">
            <TextField
              label="Nama"
              fullWidth
              name="username"
              value={editedProfile.username}
              onChange={handleInputChange}
            />
            <TextField
              label="Email"
              fullWidth
              name="email"
              value={editedProfile.email}
              disabled
            />
            <TextField
              label="Nomor telepon"
              fullWidth
              name="phoneNumber"
              value={editedProfile.phoneNumber}
              onChange={handleInputChange}
            />
            <TextField
              label="Pendidikan terakhir"
              fullWidth
              name="lastEducation"
              value={editedProfile.lastEducation}
              onChange={handleInputChange}
            />
            <TextField
              label="Jurusan"
              fullWidth
              name="major"
              value={editedProfile.major}
              onChange={handleInputChange}
            />
            <TextField
              label="Institusi tujuan"
              fullWidth
              name="destinationInstitution"
              value={editedProfile.destinationInstitution}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              variant="text"
              onClick={() => setIsEditModalOpen(false)}
              sx={{ textTransform: "none" }}
            >
              Batal
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              disabled={isSaving}
              sx={primaryActionButtonSx}
            >
              {isSaving ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </div>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
