"use client";

import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import KeyIcon from "@mui/icons-material/Key";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { DeleteModal } from "@/app/(dashboard)/_components/DeleteModal";
import HideUnhideButton from "@/app/(dashboard)/_components/HideButton";
import LockUnlockButton from "@/app/(dashboard)/_components/LockUnlockButton";
import { EmptyResponse } from "@/app/(dashboard)/_components/EmptyResponse";
import { Loader } from "@/app/(dashboard)/_components/Svgs";
import {
  useDeleteQuiz,
  usePackagesByTestName,
} from "@/app/(dashboard)/shared/queries";
import axios from "axios";

interface Tag {
  id: number;
  name: string;
}

interface PassingGrade {
  id?: number;
  type: string;
  minScore: number;
}

interface Question {
  id: number;
  content: string;
  type: string;
  packageId: number;
  image: string | null;
  explanation: string;
}

interface Package {
  id: number;
  testName: string;
  title: string;
  description: string;
  duration?: number;
  maxAttempts?: number;
  passingGrades?: PassingGrade[];
  examToken?: string | null;
  tryoutOrder?: number | null;
  isLocked: boolean;
  isHidden: boolean;
  questions: Question[];
  tags: Tag[];
}

interface PackageDetail {
  totalQuestions: number;
  highestScore: number;
  attemptCount: number;
}

async function fetchPackageDetails(packageId: number) {
  const response = await fetch(`/api/paket/info/${packageId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch package details");
  }

  return response.json();
}

export default function PaketPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [refreshData, setRefreshData] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageDetails, setPackageDetails] = useState<{
    [key: number]: PackageDetail;
  }>({});
  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const [generatingTokenId, setGeneratingTokenId] = useState<number | null>(null);
  const [durationDraft, setDurationDraft] = useState("");
  const [savingDurationId, setSavingDurationId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration: "",
    maxAttempts: "",
    passingGradeTWK: "",
    passingGradeTIU: "",
    passingGradeTKP: "",
    examToken: "",
    tryoutOrder: "",
    tags: "",
  });

  const { data, isLoading, refetch } = usePackagesByTestName(
    params.slug,
    refreshData
  );

  const {
    mutateAsync: deleteQuiz,
    isLoading: isDeleteLoading,
  } = useDeleteQuiz();

  const stats = useMemo(() => {
    const totalQuestions = packages.reduce(
      (total, item) => total + (packageDetails[item.id]?.totalQuestions || 0),
      0
    );
    const activePackages = packages.filter(
      (item) => !item.isLocked && !item.isHidden
    ).length;

    return {
      totalPackages: packages.length,
      activePackages,
      totalQuestions,
      hiddenPackages: packages.filter((item) => item.isHidden).length,
    };
  }, [packageDetails, packages]);

  useEffect(() => {
    if (data?.packages) {
      setPackages(data.packages);
      setSelectedPackage((current) => {
        if (!current) return current;
        return data.packages.find((item: Package) => item.id === current.id) || null;
      });
    }

    async function loadPackageDetails() {
      if (!data?.packages) return;

      try {
        const details = await Promise.all(
          data.packages.map((pkg: Package) => fetchPackageDetails(pkg.id))
        );
        const detailsMap = details.reduce((acc, detail) => {
          acc[detail.packageId] = detail;
          return acc;
        }, {});
        setPackageDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching package details:", error);
      }
    }

    loadPackageDetails();
  }, [data, refreshData]);

  useEffect(() => {
    setDurationDraft(
      selectedPackage?.duration ? String(selectedPackage.duration) : ""
    );
  }, [selectedPackage]);

  const handleDelete = async () => {
    if (!selectedPackage?.id) {
      enqueueSnackbar("Pilih paket terlebih dahulu", { variant: "error" });
      return;
    }

    try {
      await deleteQuiz({ id: selectedPackage.id });
      enqueueSnackbar("Paket berhasil dihapus", { variant: "success" });
      setSelectedPackage(null);
      setRefreshData((prev) => !prev);
      refetch();
    } catch (error) {
      enqueueSnackbar("Gagal menghapus paket", { variant: "error" });
    } finally {
      setDeleteModalActive(false);
    }
  };

  const generateToken = async (packageId: number) => {
    setGeneratingTokenId(packageId);

    try {
      const response = await axios.put(`/api/paket/token/${packageId}`);
      const newToken = response.data.examToken;
      setPackages((current) =>
        current.map((item) =>
          item.id === packageId ? { ...item, examToken: newToken } : item
        )
      );
      setSelectedPackage((current) =>
        current?.id === packageId ? { ...current, examToken: newToken } : current
      );
      enqueueSnackbar("Token ujian berhasil dibuat ulang", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Gagal membuat token ujian", { variant: "error" });
    } finally {
      setGeneratingTokenId(null);
    }
  };

  const copyToken = async (token?: string | null) => {
    if (!token) {
      enqueueSnackbar("Token belum tersedia", { variant: "warning" });
      return;
    }

    await navigator.clipboard.writeText(token);
    enqueueSnackbar("Token disalin", { variant: "success" });
  };

  const openEditModal = (pkg: Package) => {
    const gradeMap = new Map(
      (pkg.passingGrades || []).map((grade) => [grade.type, grade.minScore])
    );
    setSelectedPackage(pkg);
    setEditForm({
      title: pkg.title,
      description: pkg.description || "",
      duration: pkg.duration ? String(pkg.duration) : "",
      maxAttempts: pkg.maxAttempts ? String(pkg.maxAttempts) : "1",
      passingGradeTWK: String(gradeMap.get("TWK") ?? 0),
      passingGradeTIU: String(gradeMap.get("TIU") ?? 0),
      passingGradeTKP: String(gradeMap.get("TKP") ?? 0),
      examToken: pkg.examToken || "",
      tryoutOrder: pkg.tryoutOrder ? String(pkg.tryoutOrder) : "",
      tags: pkg.tags?.map((tag) => tag.name).join(", ") || params.slug.toUpperCase(),
    });
    setEditModalOpen(true);
  };

  const updateEditField = (
    field: keyof typeof editForm,
    value: string
  ) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const savePackageEdit = async () => {
    if (!selectedPackage) return;

    setSavingEdit(true);

    try {
      const tagNames = editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const response = await axios.put(`/api/paket/update/${selectedPackage.id}`, {
        title: editForm.title,
        description: editForm.description,
        duration: editForm.duration,
        maxAttempts: editForm.maxAttempts,
        passingGrades: {
          TWK: editForm.passingGradeTWK,
          TIU: editForm.passingGradeTIU,
          TKP: editForm.passingGradeTKP,
        },
        examToken: editForm.examToken,
        tryoutOrder: editForm.tryoutOrder,
        tagNames,
      });
      const updatedPackage = response.data.package;

      setPackages((current) =>
        current
          .map((item) => (item.id === selectedPackage.id ? updatedPackage : item))
          .sort((a, b) => {
            const orderA = a.tryoutOrder ?? Number.MAX_SAFE_INTEGER;
            const orderB = b.tryoutOrder ?? Number.MAX_SAFE_INTEGER;
            return orderA - orderB || a.id - b.id;
          })
      );
      setSelectedPackage(updatedPackage);
      setDurationDraft(updatedPackage.duration ? String(updatedPackage.duration) : "");
      setEditModalOpen(false);
      enqueueSnackbar("Paket berhasil diperbarui", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Gagal memperbarui paket",
        { variant: "error" }
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const updateDuration = async () => {
    if (!selectedPackage?.id) {
      enqueueSnackbar("Pilih paket terlebih dahulu", { variant: "error" });
      return;
    }

    const duration = Number(durationDraft);
    if (!Number.isInteger(duration) || duration < 1 || duration > 600) {
      enqueueSnackbar("Durasi ujian harus 1 sampai 600 menit", {
        variant: "error",
      });
      return;
    }

    setSavingDurationId(selectedPackage.id);

    try {
      const response = await axios.put(`/api/paket/timer/${selectedPackage.id}`, {
        duration,
      });
      const updatedDuration = response.data.duration;

      setPackages((current) =>
        current.map((item) =>
          item.id === selectedPackage.id
            ? { ...item, duration: updatedDuration }
            : item
        )
      );
      setSelectedPackage((current) =>
        current?.id === selectedPackage.id
          ? { ...current, duration: updatedDuration }
          : current
      );
      enqueueSnackbar("Durasi ujian berhasil diperbarui", {
        variant: "success",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Gagal memperbarui durasi ujian",
        { variant: "error" }
      );
    } finally {
      setSavingDurationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-teal-700"
            >
              <ArrowBackIcon fontSize="small" />
              Kembali ke dashboard
            </button>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              Manajemen Paket CBT
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Paket {params.slug.toUpperCase()}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Atur paket, token sesi ujian, status akses, dan bank soal dari
              satu halaman admin.
            </p>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(`/dashboard/${params.slug}/create`)}
          >
            Buat Paket
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total paket</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {stats.totalPackages}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Paket aktif</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {stats.activePackages}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total soal</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {stats.totalQuestions}
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Disembunyikan</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">
              {stats.hiddenPackages}
            </p>
          </div>
        </div>

        {selectedPackage && (
          <div className="mt-6 rounded-md border border-teal-200 bg-teal-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  Paket dipilih
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {selectedPackage.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Token:{" "}
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedPackage.examToken || "Belum ada token"}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Durasi saat ini:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedPackage.duration || 0} menit
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Batas percobaan:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedPackage.maxAttempts || 1} kali per siswa
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedPackage.passingGrades || []).length ? (
                    selectedPackage.passingGrades?.map((grade) => (
                      <span
                        key={grade.type}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-100"
                      >
                        PG {grade.type}: {grade.minScore}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      Nilai batas kelulusan belum diatur
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outlined"
                  startIcon={<EditNoteIcon />}
                  onClick={() => openEditModal(selectedPackage)}
                >
                  Edit Paket
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToken(selectedPackage.examToken)}
                >
                  Salin Token
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<RefreshIcon />}
                  disabled={generatingTokenId === selectedPackage.id}
                  onClick={() => generateToken(selectedPackage.id)}
                >
                  Generate Token
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditNoteIcon />}
                  onClick={() =>
                    router.push(`/dashboard/${params.slug}/${selectedPackage.id}`)
                  }
                >
                  Kelola Soal
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setDeleteModalActive(true)}
                >
                  Hapus
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-md border border-teal-100 bg-white p-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label
                  htmlFor="package-duration"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                  <AccessTimeIcon fontSize="small" />
                  Atur durasi ujian
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Durasi dipakai oleh timer CBT saat siswa mengerjakan paket ini.
                </p>
                <div className="mt-3 flex max-w-xs items-center rounded-md border border-slate-300 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50">
                  <input
                    id="package-duration"
                    type="number"
                    min={1}
                    max={600}
                    value={durationDraft}
                    onChange={(event) => setDurationDraft(event.target.value)}
                    className="h-11 w-full rounded-md border-0 bg-transparent px-3 text-sm font-semibold text-slate-950 outline-none"
                    placeholder="120"
                  />
                  <span className="border-l border-slate-200 px-3 text-sm font-medium text-slate-500">
                    menit
                  </span>
                </div>
              </div>
              <Button
                variant="contained"
                startIcon={
                  savingDurationId === selectedPackage.id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AccessTimeIcon />
                  )
                }
                disabled={savingDurationId === selectedPackage.id}
                onClick={updateDuration}
              >
                Simpan Durasi
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <Loader halfScreen />
        ) : packages.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => {
              const detail = packageDetails[pkg.id];
              const tags =
                pkg.tags?.length > 0
                  ? pkg.tags.map((tag) => tag.name)
                  : [params.slug.toUpperCase()];
              const isSelected = selectedPackage?.id === pkg.id;

              return (
                <article
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`cursor-pointer rounded-md border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md ${
                    isSelected ? "border-teal-500 ring-2 ring-teal-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          TO {pkg.tryoutOrder ?? "-"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            pkg.isLocked
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {pkg.isLocked ? "Terkunci" : "Aktif"}
                        </span>
                        {pkg.isHidden && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <VisibilityOffIcon fontSize="inherit" />
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-slate-950">
                        {pkg.title}
                      </h3>
                    </div>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        copyToken(pkg.examToken);
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </div>

                  <p className="mt-3 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-600">
                    {pkg.description || "Belum ada deskripsi paket."}
                  </p>

                  <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <KeyIcon fontSize="small" />
                        <span className="text-xs font-semibold uppercase">
                          Token ujian
                        </span>
                      </div>
                      <Button
                        size="small"
                        variant="text"
                        disabled={generatingTokenId === pkg.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          generateToken(pkg.id);
                        }}
                      >
                        {generatingTokenId === pkg.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </div>
                    <p className="mt-2 break-all font-mono text-sm font-bold text-slate-950">
                      {pkg.examToken || "Belum ada token"}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Soal</p>
                      <p className="font-bold text-slate-950">
                        {detail?.totalQuestions ?? pkg.questions?.length ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Durasi</p>
                      <p className="font-bold text-slate-950">
                        {pkg.duration || 0} menit
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Percobaan</p>
                      <p className="font-bold text-slate-950">
                        {detail?.attemptCount ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                    Batas pengerjaan:{" "}
                    <span className="text-slate-950">
                      {pkg.maxAttempts || 1} kali per siswa
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(pkg.passingGrades || []).length ? (
                      pkg.passingGrades?.map((grade) => (
                        <span
                          key={grade.type}
                          className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {grade.type} &gt;= {grade.minScore}
                        </span>
                      ))
                    ) : (
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                        PG belum diatur
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className="mt-5 flex flex-wrap gap-2"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<EditNoteIcon />}
                      onClick={() => router.push(`/dashboard/${params.slug}/${pkg.id}`)}
                    >
                      Kelola Soal
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditNoteIcon />}
                      onClick={() => openEditModal(pkg)}
                    >
                      Edit Paket
                    </Button>
                    <LockUnlockButton
                      testName={pkg.testName}
                      packageId={pkg.id}
                      isLocked={pkg.isLocked}
                    />
                    <HideUnhideButton
                      packageId={pkg.id}
                      isHidden={pkg.isHidden}
                      testName={pkg.testName}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyResponse resource="Paket" />
          </div>
        )}
      </div>

      {deleteModalActive && (
        <DeleteModal
          deleteLoading={isDeleteLoading}
          deleteModalActive={deleteModalActive}
          handleDeleteModalClose={() => setDeleteModalActive(false)}
          onDelete={handleDelete}
          resource="Paket"
        />
      )}

      {editModalOpen && selectedPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Edit Paket CBT
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  {selectedPackage.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Perbarui metadata paket, token sesi, durasi, tag, dan urutan TO.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                aria-label="Tutup modal edit paket"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-172px)] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Nama Paket
                  </label>
                  <input
                    value={editForm.title}
                    onChange={(event) => updateEditField("title", event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="Contoh: Paket SKD TO 1"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Urutan Try Out
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.tryoutOrder}
                    onChange={(event) =>
                      updateEditField("tryoutOrder", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Durasi Ujian
                  </label>
                  <div className="mt-2 flex h-11 rounded-md border border-slate-300 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50">
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={editForm.duration}
                      onChange={(event) =>
                        updateEditField("duration", event.target.value)
                      }
                      className="w-full rounded-md border-0 bg-transparent px-3 text-sm outline-none"
                      placeholder="120"
                    />
                    <span className="flex items-center border-l border-slate-200 px-3 text-sm font-medium text-slate-500">
                      menit
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-800">
                    Batas Percobaan
                  </label>
                  <div className="mt-2 flex h-11 rounded-md border border-slate-300 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={editForm.maxAttempts}
                      onChange={(event) =>
                        updateEditField("maxAttempts", event.target.value)
                      }
                      className="w-full rounded-md border-0 bg-transparent px-3 text-sm outline-none"
                      placeholder="1"
                    />
                    <span className="flex items-center border-l border-slate-200 px-3 text-sm font-medium text-slate-500">
                      kali
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Maksimal siswa mengerjakan paket ini.
                  </p>
                </div>

                <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    Nilai Batas Kelulusan
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Isi 0 untuk kategori yang tidak digunakan pada paket ini.
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {[
                      ["passingGradeTWK", "TWK"],
                      ["passingGradeTIU", "TIU"],
                      ["passingGradeTKP", "TKP"],
                    ].map(([field, label]) => (
                      <div key={field}>
                        <label className="text-xs font-semibold text-slate-600">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={editForm[field as keyof typeof editForm]}
                          onChange={(event) =>
                            updateEditField(
                              field as keyof typeof editForm,
                              event.target.value
                            )
                          }
                          className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Token Ujian
                  </label>
                  <input
                    value={editForm.examToken}
                    onChange={(event) =>
                      updateEditField("examToken", event.target.value.toUpperCase())
                    }
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-mono text-sm font-semibold outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="SKD-TO1-2026"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Token ini dipakai siswa untuk membuka paket. Token harus unik.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Tags
                  </label>
                  <input
                    value={editForm.tags}
                    onChange={(event) => updateEditField("tags", event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="SKD, Nasionalisme, TO 1"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Pisahkan beberapa tag dengan koma.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Deskripsi Paket
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(event) =>
                      updateEditField("description", event.target.value)
                    }
                    rows={5}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50"
                    placeholder="Jelaskan fokus materi, aturan, dan tujuan paket."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                variant="outlined"
                onClick={() => setEditModalOpen(false)}
                disabled={savingEdit}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                onClick={savePackageEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
