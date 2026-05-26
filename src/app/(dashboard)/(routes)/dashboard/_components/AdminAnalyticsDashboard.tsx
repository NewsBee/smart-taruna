"use client";

import {
  Assessment,
  Download,
  ManageAccounts,
  Groups,
  Inventory2,
  ManageSearch,
  MonitorHeart,
  OpenInNew,
  PersonSearch,
  Search,
  PlayCircle,
  Quiz,
  Security,
  TrendingUp,
  WarningAmber,
} from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type AnalyticsData = {
  summary: {
    totalStudents: number;
    totalTests: number;
    totalPackages: number;
    totalQuestions: number;
    totalAttempts: number;
    activeSessions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    questionsNeedReview: number;
    highRiskStudents: number;
  };
  tests: Array<{ id: number; name: string }>;
  students: Array<{
    id: number;
    username: string;
    email: string;
    totalAttempts: number;
    latestScore: number | null;
    highestScore: number;
    averageScore: number;
    lastTest: string;
    lastCompletedAt: string;
    totalSecurityEvents: number;
    riskScore: number;
    riskLevel: string;
    strongestType: string;
    weakestType: string;
    progressDelta: number | null;
    progressTrend: string;
    totalPausedMinutes: number;
    recommendation: string;
    typeBreakdown: Array<{
      type: string;
      totalScore: number;
      totalAnswers: number;
      positiveAnswers: number;
      blankAnswers: number;
      accuracy: number;
      blankRate: number;
    }>;
    attempts: Array<{
      id: number;
      packageId: number;
      packageTitle: string;
      testName: string;
      tryoutOrder: number | null;
      tryoutLabel: string;
      score: number;
      startedAt: string;
      completedAt: string;
      answered: number;
      totalQuestions: number;
      correctAnswers: number;
      answeredRate: number;
      durationMinutes: number | null;
      pausedMinutes: number;
      securityEvents: number;
    }>;
    packageBreakdown: Array<{
      packageId: number;
      packageTitle: string;
      testName: string;
      tryoutOrder: number | null;
      tryoutLabel: string;
      totalAttempts: number;
      highestScore: number;
      averageScore: number;
    }>;
  }>;
  packages: Array<{
    id: number;
    title: string;
    testName: string;
    tryoutOrder: number | null;
    tryoutLabel: string;
    duration: number | null;
    totalQuestions: number;
    totalAttempts: number;
    participantCount: number;
    activeSessionCount: number;
    completionRate: number;
    averageScore: number;
    highestScore: number;
    passingRate: number;
    scoreDistribution: Array<{
      label: string;
      count: number;
      percentage: number;
    }>;
    typeBreakdown: Array<{
      type: string;
      totalQuestions: number;
    }>;
    reviewQuestionCount: number;
    healthyQuestionCount: number;
    questionQualityRate: number;
    riskScore: number;
    riskLevel: string;
    passingGrades: Array<{
      type: string;
      minScore: number;
    }>;
    status: string;
  }>;
  questions: Array<{
    questionId: number;
    content: string;
    type: string;
    packageId: number;
    packageTitle: string;
    testName: string;
    tryoutOrder: number | null;
    totalAnswers: number;
    correctAnswers: number;
    blankAnswers: number;
    difficulty: number;
    blankRate: number;
    averageScore: number;
    wrongAnswers: number;
    mostChosenAnswer: string;
    mostChosenCount: number;
    mostChosenIsCorrect: boolean;
    issueFlags: string[];
    qualityStatus: string;
    optionBreakdown: Array<{
      content: string;
      isCorrect: boolean;
      scoreValue: number;
      selectedCount: number;
      selectedRate: number;
    }>;
  }>;
  questionSummary: {
    totalReviewed: number;
    needsReview: number;
    tooHard: number;
    tooEasy: number;
    highBlank: number;
  };
  recentAttempts: Array<{
    id: number;
    studentName: string;
    email: string;
    packageTitle: string;
    testName: string;
    packageId: number;
    tryoutOrder: number | null;
    tryoutLabel: string;
    score: number;
    completedAt: string;
  }>;
  activeSessions: Array<{
    id: number;
    studentName: string;
    email: string;
    packageTitle: string;
    testName: string;
    tryoutOrder: number | null;
    tryoutLabel: string;
    startedAt: string;
    lastHeartbeatAt: string;
    savedAnswers: number;
    securityEventCount: number;
    riskScore: number;
    riskLevel: string;
    recentSecurityEvents: Array<{
      id: number;
      type: string;
      createdAt: string;
    }>;
  }>;
  securityEvents: Array<{
    id: number;
    type: string;
    createdAt: string;
    studentName: string;
    email: string;
    attemptId: number;
    packageTitle: string;
    testName: string;
    tryoutOrder: number | null;
    tryoutLabel: string;
  }>;
  securitySummary: {
    riskSummary: {
      low: number;
      medium: number;
      high: number;
    };
    topRiskStudents: Array<{
      id: number;
      username: string;
      email: string;
      riskScore: number;
      riskLevel: string;
      totalSecurityEvents: number;
      totalPausedMinutes: number;
    }>;
    eventBreakdown: Array<{
      type: string;
      count: number;
    }>;
    recentEventCount: number;
  };
};

const initialData: AnalyticsData | null = null;

type StudentRow = AnalyticsData["students"][number];
type DashboardTab = "overview" | "students" | "packages" | "questions" | "monitoring";

const analyticsLinks: Array<{
  key: Exclude<DashboardTab, "overview">;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}> = [
  {
    key: "students",
    label: "Analitik Siswa",
    description: "Rekap nilai, perkembangan try out, dan analisis individu.",
    href: "/dashboard/analytics/students",
    icon: <PersonSearch fontSize="small" />,
  },
  {
    key: "packages",
    label: "Analitik Paket",
    description: "Performa paket, distribusi nilai, kelulusan, dan kualitas TO.",
    href: "/dashboard/analytics/packages",
    icon: <Inventory2 fontSize="small" />,
  },
  {
    key: "questions",
    label: "Analitik Soal",
    description: "Tingkat kesulitan, distraktor, jawaban kosong, dan soal perlu ditinjau.",
    href: "/dashboard/analytics/questions",
    icon: <ManageSearch fontSize="small" />,
  },
  {
    key: "monitoring",
    label: "Keamanan Ujian",
    description: "Sesi aktif, aktivitas mencurigakan, dan skor risiko siswa.",
    href: "/dashboard/analytics/security",
    icon: <Security fontSize="small" />,
  },
];

function MetricCard({
  title,
  value,
  caption,
  icon,
  tone = "indigo",
}: {
  title: string;
  value: string | number;
  caption: string;
  icon: React.ReactNode;
  tone?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
          <p className="mt-2 text-xs leading-5 text-gray-500">{caption}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "Terbit" || status === "Published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Dikunci" || status === "Locked"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-gray-200 bg-gray-50 text-gray-600";
  const label =
    status === "Published"
      ? "Terbit"
      : status === "Locked"
      ? "Dikunci"
      : status === "Hidden"
      ? "Disembunyikan"
      : status;

  return (
    <span className={`rounded border px-2 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const className =
    level === "Tinggi"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : level === "Sedang"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded border px-2 py-1 text-xs font-semibold ${className}`}>
      Risiko {level}
    </span>
  );
}

function QualityBadge({ status }: { status: string }) {
  const className =
    status === "Perlu ditinjau" || status === "Perlu review"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : status === "Sehat"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-gray-200 bg-gray-50 text-gray-600";

  return (
    <span className={`rounded border px-2 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function activityLabel(type: string) {
  const labels: Record<string, string> = {
    TAB_HIDDEN: "Keluar dari tab ujian",
    TAB_VISIBLE: "Kembali ke tab ujian",
    WINDOW_BLUR: "Berpindah dari jendela ujian",
    WINDOW_FOCUS: "Kembali aktif di jendela ujian",
  };

  return labels[type] || type;
}

function averageClient(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default function AdminAnalyticsDashboard({
  initialTab = "overview",
  overviewOnly = false,
}: {
  initialTab?: DashboardTab;
  overviewOnly?: boolean;
}) {
  const [data, setData] = useState<AnalyticsData | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedTestName, setSelectedTestName] = useState("all");
  const [selectedPackageId, setSelectedPackageId] = useState("all");
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<"priority" | "all" | "normal">("priority");
  const [visibleSessionCount, setVisibleSessionCount] = useState(20);
  const [activitySearch, setActivitySearch] = useState("");
  const router = useRouter();

  const selectedPackage = useMemo(() => {
    if (selectedPackageId === "all") return null;
    return (data?.packages || []).find((pkg) => String(pkg.id) === selectedPackageId) || null;
  }, [data, selectedPackageId]);

  const packageOptions = useMemo(() => {
    return (data?.packages || []).filter((pkg) =>
      selectedTestName === "all" ? true : pkg.testName === selectedTestName
    );
  }, [data, selectedTestName]);

  useEffect(() => {
    if (
      selectedPackageId !== "all" &&
      !packageOptions.some((pkg) => String(pkg.id) === selectedPackageId)
    ) {
      setSelectedPackageId("all");
    }
  }, [packageOptions, selectedPackageId]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) throw new Error("Gagal mengambil analitik admin");
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const topStudents = useMemo(() => {
    return [...(data?.students || [])]
      .sort((a, b) => b.highestScore - a.highestScore)
      .slice(0, 5);
  }, [data]);

  const filteredStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();
    const hasAnalyticsFilter =
      selectedTestName !== "all" || selectedPackageId !== "all";

    return (data?.students || [])
      .filter((student) =>
        keyword
          ? `${student.username} ${student.email}`.toLowerCase().includes(keyword)
          : true
      )
      .map((student) => {
        const attempts = student.attempts.filter((attempt) => {
          const matchesTest =
            selectedTestName === "all" || attempt.testName === selectedTestName;
          const matchesPackage =
            selectedPackageId === "all" ||
            String(attempt.packageId) === selectedPackageId;
          return matchesTest && matchesPackage;
        });
        const packageBreakdown = student.packageBreakdown.filter((pkg) => {
          const matchesTest =
            selectedTestName === "all" || pkg.testName === selectedTestName;
          const matchesPackage =
            selectedPackageId === "all" ||
            String(pkg.packageId) === selectedPackageId;
          return matchesTest && matchesPackage;
        });
        const scores = attempts.map((attempt) => attempt.score ?? 0);
        const latestAttempt = attempts[0];
        const securityEvents = attempts.reduce(
          (sum, attempt) => sum + attempt.securityEvents,
          0
        );

        if (!hasAnalyticsFilter) return student;

        return {
          ...student,
          totalAttempts: attempts.length,
          latestScore: latestAttempt?.score ?? null,
          highestScore: scores.length ? Math.max(...scores) : 0,
          averageScore: averageClient(scores),
          lastTest:
            selectedPackage?.title ||
            latestAttempt?.packageTitle ||
            (selectedTestName === "all" ? "-" : selectedTestName),
          lastCompletedAt: latestAttempt?.completedAt || "-",
          totalSecurityEvents: securityEvents,
          attempts,
          packageBreakdown,
        };
      })
      .filter((student) => {
        if (!hasAnalyticsFilter) return true;
        if (selectedPackageId !== "all") return true;
        return student.totalAttempts > 0;
      });
  }, [data, selectedPackage, selectedPackageId, selectedTestName, studentSearch]);

  const filteredActiveSessions = useMemo(() => {
    const keyword = sessionSearch.trim().toLowerCase();
    const sessions = data?.activeSessions || [];

    return sessions.filter((session) => {
      const matchesKeyword = keyword
        ? `${session.studentName} ${session.email} ${session.packageTitle} ${session.testName}`
            .toLowerCase()
            .includes(keyword)
        : true;
      const matchesFilter =
        sessionFilter === "all"
          ? true
          : sessionFilter === "priority"
          ? session.securityEventCount > 0
          : session.securityEventCount === 0;

      return matchesKeyword && matchesFilter;
    });
  }, [data, sessionFilter, sessionSearch]);

  const visibleActiveSessions = useMemo(
    () => filteredActiveSessions.slice(0, visibleSessionCount),
    [filteredActiveSessions, visibleSessionCount]
  );

  const filteredSecurityEvents = useMemo(() => {
    const keyword = activitySearch.trim().toLowerCase();
    if (!keyword) return data?.securityEvents || [];

    return (data?.securityEvents || []).filter((event) =>
      `${event.studentName} ${event.email} ${event.packageTitle} ${event.testName} ${activityLabel(event.type)}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [activitySearch, data]);

  useEffect(() => {
    if (!data?.students.length) return;
    setSelectedStudent((current) => current || data.students[0]);
  }, [data]);

  useEffect(() => {
    setVisibleSessionCount(20);
  }, [sessionFilter, sessionSearch]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-10 py-10">
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {error || "Data admin tidak tersedia"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Pusat Kendali Admin
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
                Ringkasan CBT Smart Taruna
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                Pantau kondisi ujian, kualitas soal, hasil try out, dan keamanan pengerjaan dari halaman yang lebih ringkas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.tests.map((test) => (
                <Button
                  key={test.id}
                  variant="outlined"
                  onClick={() => router.push(`/dashboard/${test.name}`)}
                >
                  Kelola {test.name}
                </Button>
              ))}
              <Button
                variant="outlined"
                startIcon={<ManageAccounts />}
                onClick={() => router.push("/dashboard/users")}
              >
                Manajemen User
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => window.open("/api/admin/export?type=attempts", "_blank")}
              >
                Ekspor Nilai
              </Button>
            </div>
          </div>
        </section>

        {(overviewOnly || activeTab === "overview") && (
          <>
            <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Total Siswa"
                value={data.summary.totalStudents}
                caption="Akun siswa terdaftar"
                icon={<Groups fontSize="small" />}
                tone="indigo"
              />
              <MetricCard
                title="Sesi Ujian Selesai"
                value={data.summary.totalAttempts}
                caption="Sesi ujian yang sudah dikumpulkan"
                icon={<Assessment fontSize="small" />}
                tone="emerald"
              />
              <MetricCard
                title="Rata-rata Nilai"
                value={data.summary.averageScore}
                caption={`Tertinggi ${data.summary.highestScore}, terendah ${data.summary.lowestScore}`}
                icon={<TrendingUp fontSize="small" />}
                tone="amber"
              />
              <MetricCard
                title="Sesi Aktif"
                value={data.summary.activeSessions}
                caption="Siswa yang masih mengerjakan"
                icon={<PlayCircle fontSize="small" />}
                tone="rose"
              />
            </section>

            <section className="mt-5 grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Paket Ujian"
                value={data.summary.totalPackages}
                caption="Total paket SKD/TPA"
                icon={<Inventory2 fontSize="small" />}
                tone="slate"
              />
              <MetricCard
                title="Bank Soal Paket"
                value={data.summary.totalQuestions}
                caption="Soal yang tersedia pada semua paket"
                icon={<Quiz fontSize="small" />}
                tone="slate"
              />
              <MetricCard
                title="Butuh Evaluasi"
                value={data.summary.questionsNeedReview}
                caption="Soal yang ditandai perlu ditinjau"
                icon={<ManageSearch fontSize="small" />}
                tone="rose"
              />
            </section>
          </>
        )}

        {overviewOnly ? (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {analyticsLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => router.push(link.href)}
                className="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                  {link.icon}
                </div>
                <h2 className="mt-4 font-semibold text-gray-950">{link.label}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{link.description}</p>
              </button>
            ))}
          </section>
        ) : (
          <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200">
            {analyticsLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => {
                  setActiveTab(link.key);
                  router.push(link.href);
                }}
                className={`border-b-2 px-4 py-3 text-sm font-semibold ${
                  activeTab === link.key
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-950">Pengerjaan Terbaru</h2>
                <Button size="small" onClick={() => window.open("/api/admin/export?type=attempts", "_blank")}>
                    Ekspor
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-3">Siswa</th>
                      <th className="px-3 py-3">Paket</th>
                      <th className="px-3 py-3">Jenis Ujian</th>
                      <th className="px-3 py-3">Skor</th>
                      <th className="px-3 py-3">Selesai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.recentAttempts.slice(0, 5).map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gray-950">{attempt.studentName}</p>
                          <p className="text-xs text-gray-500">{attempt.email}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p>{attempt.packageTitle}</p>
                          <p className="text-xs text-gray-500">{attempt.tryoutLabel}</p>
                        </td>
                        <td className="px-3 py-3">{attempt.testName}</td>
                        <td className="px-3 py-3 font-semibold">{attempt.score}</td>
                        <td className="px-3 py-3 text-gray-600">{attempt.completedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Sesi Ujian Aktif</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Scroll daftar ini saat peserta aktif bertambah banyak.
                  </p>
                </div>
                <Button size="small" onClick={() => router.push("/dashboard/analytics/security")}>
                  Detail
                </Button>
              </div>
              <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2">
                    {data.activeSessions.length ? (
                  data.activeSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">{session.studentName}</p>
                          <p className="text-xs text-gray-500">{session.email}</p>
                        </div>
                        <span className={`rounded px-2 py-1 text-xs font-semibold ${
                          session.securityEventCount > 0
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {session.securityEventCount > 0
                            ? `${session.securityEventCount} aktivitas`
                            : "Aktif"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-700">
                        {session.tryoutLabel} - {session.packageTitle}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Mulai {session.startedAt} | Terakhir aktif {session.lastHeartbeatAt} | Tersimpan {session.savedAnswers} jawaban
                      </p>
                      {session.recentSecurityEvents.length > 0 && (
                        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          Terakhir: {activityLabel(session.recentSecurityEvents[0].type)} pada {session.recentSecurityEvents[0].createdAt}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
                    Tidak ada sesi aktif.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Kesehatan Bank Soal</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Ringkasan soal yang sudah memiliki data jawaban siswa.
                  </p>
                </div>
                <Button size="small" onClick={() => router.push("/dashboard/analytics/questions")}>
                  Detail
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-gray-50 p-3">
                  <p className="text-gray-500">Sudah dianalisis</p>
                  <p className="mt-1 text-xl font-bold text-gray-950">
                    {data.questionSummary.totalReviewed}
                  </p>
                </div>
                <div className="rounded-md bg-rose-50 p-3">
                  <p className="text-rose-700">Perlu ditinjau</p>
                  <p className="mt-1 text-xl font-bold text-rose-800">
                    {data.questionSummary.needsReview}
                  </p>
                </div>
                <div className="rounded-md bg-amber-50 p-3">
                  <p className="text-amber-700">Terlalu sulit</p>
                  <p className="mt-1 text-xl font-bold text-amber-800">
                    {data.questionSummary.tooHard}
                  </p>
                </div>
                <div className="rounded-md bg-indigo-50 p-3">
                  <p className="text-indigo-700">Banyak kosong</p>
                  <p className="mt-1 text-xl font-bold text-indigo-800">
                    {data.questionSummary.highBlank}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Risiko Keamanan</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Ringkasan siswa berdasarkan aktivitas ujian yang tercatat.
                  </p>
                </div>
                <Button size="small" onClick={() => router.push("/dashboard/analytics/security")}>
                  Detail
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-md bg-emerald-50 p-3">
                  <p className="text-emerald-700">Rendah</p>
                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    {data.securitySummary.riskSummary.low}
                  </p>
                </div>
                <div className="rounded-md bg-amber-50 p-3">
                  <p className="text-amber-700">Sedang</p>
                  <p className="mt-1 text-xl font-bold text-amber-800">
                    {data.securitySummary.riskSummary.medium}
                  </p>
                </div>
                <div className="rounded-md bg-rose-50 p-3">
                  <p className="text-rose-700">Tinggi</p>
                  <p className="mt-1 text-xl font-bold text-rose-800">
                    {data.securitySummary.riskSummary.high}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {data.securitySummary.topRiskStudents.slice(0, 3).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-950">
                        {student.username}
                      </p>
                      <p className="truncate text-xs text-gray-500">{student.email}</p>
                    </div>
                    <RiskBadge level={student.riskLevel} />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
              <h2 className="text-lg font-semibold text-gray-950">Siswa Teratas</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {topStudents.map((student, index) => (
                  <div key={student.id} className="rounded-md border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-indigo-600">#{index + 1}</p>
                    <p className="mt-2 truncate font-semibold text-gray-950">{student.username}</p>
                    <p className="mt-1 text-xs text-gray-500">{student.totalAttempts} kali mengerjakan</p>
                    <p className="mt-3 text-2xl font-bold text-gray-950">{student.highestScore}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "students" && (
          <div className="mt-5">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Rekap Nilai Siswa</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Filter berdasarkan test atau paket agar TO 1, TO 2, dan seterusnya terbaca sesuai urutan paket.
                  </p>
                </div>
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
                    <input
                      value={studentSearch}
                      onChange={(event) => setStudentSearch(event.target.value)}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 xl:w-64"
                      placeholder="Cari nama atau email"
                    />
                  </div>
                  <select
                    value={selectedTestName}
                    onChange={(event) => {
                      setSelectedTestName(event.target.value);
                      setSelectedPackageId("all");
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="all">Semua Jenis Ujian</option>
                    {data.tests.map((test) => (
                      <option key={test.id} value={test.name}>
                        {test.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedPackageId}
                    onChange={(event) => setSelectedPackageId(event.target.value)}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="all">Semua Paket</option>
                    {packageOptions.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.tryoutLabel} - {pkg.title}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={() => window.open("/api/admin/export?type=students", "_blank")}
                  >
                    Ekspor Siswa
                  </Button>
                </div>
              </div>
              <div className="mb-4 rounded-md border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                {selectedPackage ? (
                  <span>
                    Menampilkan analitik khusus <strong>{selectedPackage.tryoutLabel}</strong>:{" "}
                    {selectedPackage.title}.
                  </span>
                ) : selectedTestName !== "all" ? (
                  <span>
                    Menampilkan progres semua paket pada jenis ujian <strong>{selectedTestName}</strong>{" "}
                    berdasarkan urutan TO.
                  </span>
                ) : (
                  <span>
                    Menampilkan seluruh progres siswa lintas paket. Gunakan filter paket untuk melihat hasil satu TO tertentu.
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-3">Siswa</th>
                      <th className="px-3 py-3">Pengerjaan</th>
                      <th className="px-3 py-3">Nilai Terakhir</th>
                      <th className="px-3 py-3">Tertinggi</th>
                      <th className="px-3 py-3">Rata-rata</th>
                      <th className="px-3 py-3">Aktivitas</th>
                      <th className="px-3 py-3">Risiko</th>
                      <th className="px-3 py-3">Analisis Materi</th>
                      <th className="px-3 py-3">Paket / TO</th>
                      <th className="px-3 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gray-950">{student.username}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </td>
                        <td className="px-3 py-3">{student.totalAttempts}</td>
                        <td className="px-3 py-3">{student.latestScore ?? "-"}</td>
                        <td className="px-3 py-3 font-semibold">{student.highestScore}</td>
                        <td className="px-3 py-3">{student.averageScore}</td>
                        <td className="px-3 py-3">{student.totalSecurityEvents}</td>
                        <td className="px-3 py-3">
                          <RiskBadge level={student.riskLevel} />
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-xs text-gray-500">Terkuat: {student.strongestType}</p>
                          <p className="text-xs text-gray-500">Perlu latihan: {student.weakestType}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p>{student.totalAttempts ? student.lastTest : "Belum mengerjakan"}</p>
                          <p className="text-xs text-gray-500">
                            {selectedPackage?.tryoutLabel || student.lastCompletedAt}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PersonSearch />}
                            onClick={() => {
                              setSelectedStudent(student);
                              setStudentModalOpen(true);
                            }}
                          >
                            Analitik
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredStudents.length && (
                  <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
                    Tidak ada siswa yang cocok dengan pencarian.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "monitoring" && (
          <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Ringkasan Keamanan Ujian</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Skor risiko dihitung dari aktivitas keluar tab, berpindah jendela, jeda koneksi, dan sesi aktif.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-emerald-50 px-4 py-3">
                    <p className="font-bold text-emerald-800">{data.securitySummary.riskSummary.low}</p>
                    <p className="text-xs text-emerald-700">Rendah</p>
                  </div>
                  <div className="rounded-md bg-amber-50 px-4 py-3">
                    <p className="font-bold text-amber-800">{data.securitySummary.riskSummary.medium}</p>
                    <p className="text-xs text-amber-700">Sedang</p>
                  </div>
                  <div className="rounded-md bg-rose-50 px-4 py-3">
                    <p className="font-bold text-rose-800">{data.securitySummary.riskSummary.high}</p>
                    <p className="text-xs text-rose-700">Tinggi</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-950">Siswa Risiko Tertinggi</p>
                  <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-2">
                    {data.securitySummary.topRiskStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-950">{student.username}</p>
                          <p className="truncate text-xs text-gray-500">
                            {student.totalSecurityEvents} aktivitas, jeda {student.totalPausedMinutes} menit
                          </p>
                        </div>
                        <RiskBadge level={student.riskLevel} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-md border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-950">Jenis Aktivitas Terbaru</p>
                  <div className="mt-3 space-y-2">
                    {data.securitySummary.eventBreakdown.length ? (
                      data.securitySummary.eventBreakdown.map((event) => (
                        <div key={event.type}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{activityLabel(event.type)}</span>
                            <span className="font-semibold text-gray-950">{event.count}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                            <div
                              className="h-1.5 rounded-full bg-amber-500"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((event.count / Math.max(data.securitySummary.recentEventCount, 1)) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                        Belum ada aktivitas keamanan yang tercatat.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Monitoring Sesi Aktif</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Default menampilkan peserta yang perlu perhatian agar admin tidak perlu scroll semua sesi.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-700">
                  <MonitorHeart fontSize="small" />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
                  <input
                    value={sessionSearch}
                    onChange={(event) => setSessionSearch(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 lg:w-72"
                    placeholder="Cari nama, email, atau paket"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["priority", "Perlu perhatian"],
                    ["normal", "Normal"],
                    ["all", "Semua"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setSessionFilter(value as "priority" | "normal" | "all")}
                      className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                        sessionFilter === value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Menampilkan {visibleActiveSessions.length} dari {filteredActiveSessions.length} sesi cocok.
              </p>

              <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-2">
                {filteredActiveSessions.length ? (
                  visibleActiveSessions.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-md border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">{session.studentName}</p>
                          <p className="text-xs text-gray-500">{session.email}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <RiskBadge level={session.riskLevel} />
                          <span
                            className={`rounded px-2 py-1 text-xs font-semibold ${
                              session.securityEventCount > 0
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {session.securityEventCount > 0
                              ? `${session.securityEventCount} aktivitas`
                              : "Normal"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded bg-gray-50 p-3">
                          <p className="text-gray-500">Paket</p>
                          <p className="mt-1 font-semibold text-gray-950">
                            {session.tryoutLabel} - {session.packageTitle}
                          </p>
                        </div>
                        <div className="rounded bg-gray-50 p-3">
                          <p className="text-gray-500">Jawaban Tersimpan</p>
                          <p className="mt-1 font-semibold text-gray-950">{session.savedAnswers}</p>
                        </div>
                        <div className="rounded bg-gray-50 p-3">
                          <p className="text-gray-500">Mulai</p>
                          <p className="mt-1 font-semibold text-gray-950">{session.startedAt}</p>
                        </div>
                        <div className="rounded bg-gray-50 p-3">
                          <p className="text-gray-500">Terakhir Aktif</p>
                          <p className="mt-1 font-semibold text-gray-950">{session.lastHeartbeatAt}</p>
                        </div>
                      </div>
                      {session.recentSecurityEvents.length > 0 && (
                        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs font-semibold uppercase text-amber-800">
                            Aktivitas terbaru
                          </p>
                          <div className="mt-2 space-y-1">
                            {session.recentSecurityEvents.map((event) => (
                              <p key={event.id} className="text-xs text-amber-900">
                                {activityLabel(event.type)} pada {event.createdAt}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
                    Tidak ada sesi yang cocok dengan filter.
                  </p>
                )}
                {visibleActiveSessions.length < filteredActiveSessions.length && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setVisibleSessionCount((current) => current + 20)}
                  >
                    Tampilkan 20 sesi lagi
                  </Button>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Log Aktivitas User</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Catatan peserta keluar/masuk tab atau berpindah jendela selama ujian.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                  <Security fontSize="small" />
                </div>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fontSize="small" />
                  <input
                    value={activitySearch}
                    onChange={(event) => setActivitySearch(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    placeholder="Cari nama, email, aktivitas, atau paket"
                  />
                </div>
              </div>

              <div className="mt-4 max-h-[620px] overflow-y-auto pr-2">
                {filteredSecurityEvents.length ? (
                  <div className="space-y-3">
                    {filteredSecurityEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-md border border-gray-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-950">{event.studentName}</p>
                            <p className="text-xs text-gray-500">{event.email}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                            <WarningAmber fontSize="inherit" />
                            {activityLabel(event.type)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">
                          {event.tryoutLabel} - {event.packageTitle}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {event.testName} | Sesi #{event.attemptId} | {event.createdAt}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
                    Belum ada aktivitas mencurigakan yang tercatat.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "packages" && (
          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.packages.map((pkg) => (
              <article key={pkg.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-indigo-600">
                      {pkg.testName} | {pkg.tryoutLabel}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-950">{pkg.title}</h3>
                  </div>
                  <StatusBadge status={pkg.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Soal</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.totalQuestions}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Peserta</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.participantCount}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Pengerjaan</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.totalAttempts}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Rata-rata</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.averageScore}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Kelulusan</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.passingRate}%</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <p className="text-gray-500">Jawaban Terisi</p>
                    <p className="mt-1 font-bold text-gray-950">{pkg.completionRate}%</p>
                  </div>
                  <div className="rounded-md bg-rose-50 p-3">
                    <p className="text-rose-700">Soal Ditinjau</p>
                    <p className="mt-1 font-bold text-rose-800">{pkg.reviewQuestionCount}</p>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-3">
                    <p className="text-emerald-700">Kualitas Sehat</p>
                    <p className="mt-1 font-bold text-emerald-800">{pkg.questionQualityRate}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Distribusi nilai</span>
                    <RiskBadge level={pkg.riskLevel} />
                  </div>
                  <div className="mt-2 space-y-2">
                    {pkg.scoreDistribution.map((bucket) => (
                      <div key={bucket.label}>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{bucket.label}</span>
                          <span>{bucket.count} siswa</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-indigo-600"
                            style={{ width: `${bucket.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.typeBreakdown.map((type) => (
                    <span
                      key={type.type}
                      className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {type.type}: {type.totalQuestions} soal
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.passingGrades.length ? (
                    pkg.passingGrades.map((grade) => (
                      <span
                        key={grade.type}
                        className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                      >
                        {grade.type} &gt;= {grade.minScore}
                      </span>
                    ))
                  ) : (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                      Passing grade belum diatur
                    </span>
                  )}
                </div>
                <Button
                  className="mt-4"
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(`/dashboard/${pkg.testName}/${pkg.id}`)}
                >
                  Kelola Paket
                </Button>
              </article>
            ))}
          </section>
        )}

        {activeTab === "questions" && (
          <div className="mt-5 space-y-5">
            <section className="grid gap-4 md:grid-cols-5">
              <MetricCard
                title="Soal Dianalisis"
                value={data.questionSummary.totalReviewed}
                caption="Sudah memiliki jawaban siswa"
                icon={<Quiz fontSize="small" />}
                tone="indigo"
              />
              <MetricCard
                title="Perlu Review"
                value={data.questionSummary.needsReview}
                caption="Terdeteksi terlalu sulit, mudah, kosong, atau pengecoh lemah"
                icon={<WarningAmber fontSize="small" />}
                tone="rose"
              />
              <MetricCard
                title="Terlalu Sulit"
                value={data.questionSummary.tooHard}
                caption="Rasio benar maksimal 30%"
                icon={<ManageSearch fontSize="small" />}
                tone="amber"
              />
              <MetricCard
                title="Terlalu Mudah"
                value={data.questionSummary.tooEasy}
                caption="Rasio benar minimal 90%"
                icon={<TrendingUp fontSize="small" />}
                tone="emerald"
              />
              <MetricCard
                title="Banyak Kosong"
                value={data.questionSummary.highBlank}
                caption="Minimal 25% siswa tidak menjawab"
                icon={<Assessment fontSize="small" />}
                tone="slate"
              />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-950">Analisis Kualitas Soal</h2>
              <p className="mt-1 text-sm text-gray-600">
                Diurutkan dari soal yang paling perlu ditinjau. Gunakan kolom opsi untuk melihat distraktor yang tidak efektif.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Soal</th>
                      <th className="px-3 py-3">Tipe</th>
                      <th className="px-3 py-3">Paket</th>
                      <th className="px-3 py-3">Jawaban</th>
                      <th className="px-3 py-3">Rasio</th>
                      <th className="px-3 py-3">Opsi Paling Dipilih</th>
                      <th className="px-3 py-3">Catatan Sistem</th>
                      <th className="px-3 py-3">Distribusi Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.questions.map((question) => (
                      <tr key={question.questionId} className="align-top hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <QualityBadge status={question.qualityStatus} />
                        </td>
                        <td className="max-w-sm px-3 py-3">
                          <p className="line-clamp-3 font-medium text-gray-950">{question.content}</p>
                          <p className="mt-1 text-xs text-gray-500">ID soal #{question.questionId}</p>
                        </td>
                        <td className="px-3 py-3">{question.type}</td>
                        <td className="px-3 py-3">
                          <p>{question.packageTitle}</p>
                          <p className="text-xs text-gray-500">
                            {question.testName} | {question.tryoutOrder ? `TO ${question.tryoutOrder}` : "TO -"}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-emerald-700">Benar: {question.correctAnswers}</p>
                          <p className="text-rose-700">Salah: {question.wrongAnswers}</p>
                          <p className="text-gray-500">Kosong: {question.blankAnswers}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Benar</span>
                                <span>{question.difficulty}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-28 rounded-full bg-gray-100">
                                <div
                                  className="h-1.5 rounded-full bg-indigo-600"
                                  style={{ width: `${Math.min(question.difficulty, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Kosong</span>
                                <span>{question.blankRate}%</span>
                              </div>
                              <div className="mt-1 h-1.5 w-28 rounded-full bg-gray-100">
                                <div
                                  className="h-1.5 rounded-full bg-amber-500"
                                  style={{ width: `${Math.min(question.blankRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="line-clamp-2">{question.mostChosenAnswer}</p>
                          <p
                            className={`text-xs ${
                              question.mostChosenIsCorrect ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {question.mostChosenCount} siswa memilih
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex max-w-xs flex-wrap gap-1">
                            {question.issueFlags.length ? (
                              question.issueFlags.map((flag) => (
                                <span
                                  key={flag}
                                  className="rounded bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                                >
                                  {flag}
                                </span>
                              ))
                            ) : (
                              <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                Tidak ada catatan
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-56 space-y-2">
                            {question.optionBreakdown.map((option) => (
                              <div key={option.content}>
                                <div className="flex justify-between gap-2 text-xs">
                                  <span className={`line-clamp-1 ${option.isCorrect ? "text-emerald-700" : "text-gray-600"}`}>
                                    {option.content}
                                  </span>
                                  <span className="font-semibold text-gray-950">
                                    {option.selectedRate}%
                                  </span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      option.isCorrect ? "bg-emerald-500" : "bg-gray-400"
                                    }`}
                                    style={{ width: `${option.selectedRate}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {studentModalOpen && selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-5 py-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Analitik Individu
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-950">
                  {selectedStudent.username}
                </h2>
                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                <p className="mt-1 text-sm text-indigo-700">
                  {selectedPackage
                    ? `${selectedPackage.tryoutLabel} - ${selectedPackage.title}`
                    : selectedTestName !== "all"
                    ? `Semua paket ${selectedTestName} berdasarkan urutan TO`
                    : "Semua paket dan semua jenis ujian"}
                </p>
              </div>
              <Button variant="outlined" onClick={() => setStudentModalOpen(false)}>
                Tutup
              </Button>
            </div>

            <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Pengerjaan</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{selectedStudent.totalAttempts}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Rata-rata</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{selectedStudent.averageScore}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Tertinggi</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{selectedStudent.highestScore}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Aktivitas</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{selectedStudent.totalSecurityEvents}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Tren Nilai</p>
                  <p className="mt-1 text-2xl font-bold text-gray-950">{selectedStudent.progressTrend}</p>
                  <p className="text-xs text-gray-500">
                    {selectedStudent.progressDelta === null
                      ? "Butuh minimal dua hasil"
                      : `${selectedStudent.progressDelta > 0 ? "+" : ""}${selectedStudent.progressDelta} poin`}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-indigo-950">Rekomendasi Belajar</h3>
                      <p className="mt-2 text-sm leading-6 text-indigo-900">
                        {selectedStudent.recommendation}
                      </p>
                    </div>
                    <RiskBadge level={selectedStudent.riskLevel} />
                  </div>
                </section>

                <section className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-950">Analisis Materi</h3>
                  <div className="mt-3 space-y-3">
                    {selectedStudent.typeBreakdown.length ? (
                      selectedStudent.typeBreakdown.map((type) => (
                        <div key={type.type}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-800">{type.type}</span>
                            <span className="text-gray-500">
                              Akurasi {type.accuracy}% | Kosong {type.blankRate}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-gray-100">
                            <div
                              className="h-2 rounded-full bg-indigo-600"
                              style={{ width: `${Math.min(type.accuracy, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">
                        Belum ada data materi dari hasil try out siswa.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
                <section className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-950">Per Paket</h3>
                  <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-2">
                    {selectedStudent.packageBreakdown.length ? (
                      selectedStudent.packageBreakdown.map((pkg) => (
                        <div key={`${pkg.testName}-${pkg.packageTitle}`} className="rounded-md border border-gray-200 p-3">
                          <p className="font-semibold text-gray-950">
                            {pkg.tryoutLabel} - {pkg.packageTitle}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {pkg.testName} | {pkg.totalAttempts} kali mengerjakan
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded bg-gray-50 p-2">
                              <p className="text-gray-500">Avg</p>
                              <p className="font-bold text-gray-950">{pkg.averageScore}</p>
                            </div>
                            <div className="rounded bg-gray-50 p-2">
                              <p className="text-gray-500">Max</p>
                              <p className="font-bold text-gray-950">{pkg.highestScore}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Belum ada paket yang selesai.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-950">Hasil Try Out</h3>
                  <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-2">
                    {selectedStudent.attempts.length ? (
                      selectedStudent.attempts.map((attempt) => (
                        <div key={attempt.id} className="rounded-md border border-gray-200 p-4">
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div>
                              <p className="font-semibold text-gray-950">
                                {attempt.tryoutLabel} - {attempt.packageTitle}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {attempt.completedAt} | Terjawab {attempt.answered}/{attempt.totalQuestions} ({attempt.answeredRate}%)
                              </p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-xs text-gray-500">Skor</p>
                              <p className="text-2xl font-bold text-gray-950">{attempt.score}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                              Skor positif: {attempt.correctAnswers}
                            </span>
                            <span className="rounded bg-amber-50 px-2 py-1 text-amber-700">
                              Jeda koneksi: {attempt.pausedMinutes} menit
                            </span>
                            <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                              Durasi: {attempt.durationMinutes ?? "-"} menit
                            </span>
                            <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">
                              Catatan aktivitas: {attempt.securityEvents}
                            </span>
                          </div>
                          <Button
                            size="small"
                            className="mt-3"
                            variant="outlined"
                            endIcon={<OpenInNew />}
                            onClick={() => router.push(`/hasil/${attempt.id}`)}
                          >
                            Lihat Hasil
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-500">Belum ada hasil try out.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
