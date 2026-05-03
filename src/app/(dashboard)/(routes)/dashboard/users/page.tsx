"use client";

import {
  AdminPanelSettings,
  Edit,
  LockReset,
  Search,
  Shield,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: string;
  phoneNumber: string | null;
  education: string | null;
  major: string | null;
  institution: string | null;
  totalAttempts: number;
  latestScore: number | null;
  averageScore: number;
  highestScore: number;
};

const emptySelectedUser: UserRow = {
  id: 0,
  username: "",
  email: "",
  role: "siswa",
  phoneNumber: "",
  education: "",
  major: "",
  institution: "",
  totalAttempts: 0,
  latestScore: null,
  averageScore: 0,
  highestScore: 0,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/admin/users${query}`);
      if (!response.ok) throw new Error("Gagal mengambil data user");
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || "Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const summary = useMemo(() => {
    return {
      totalUsers: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      students: users.filter((user) => user.role !== "admin").length,
      activeStudents: users.filter((user) => user.totalAttempts > 0).length,
    };
  }, [users]);

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUser.username,
          email: selectedUser.email,
          role: selectedUser.role,
          phoneNumber: selectedUser.phoneNumber || null,
          education: selectedUser.education || null,
          major: selectedUser.major || null,
          institution: selectedUser.institution || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal menyimpan user");

      setSuccess("Data user berhasil diperbarui");
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser) return;

    try {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/admin/users/${resetUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Gagal reset password");

      setSuccess(`Password ${resetUser.username} berhasil direset`);
      setResetUser(null);
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Gagal reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Manajemen Pengguna
              </p>
              <h1 className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl">
                Manajemen Akun Peserta
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                Kelola identitas peserta, ubah email jika salah atau lupa, atur jenis akun,
                dan reset password dengan aman.
              </p>
            </div>
            <div className="flex rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              <Shield className="mr-2" fontSize="small" />
              Akses admin diperlukan
            </div>
          </div>
        </section>

        {(error || success) && (
          <div
            className={`mt-4 rounded-md border px-4 py-3 text-sm ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || success}
          </div>
        )}

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Akun</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{summary.totalUsers}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Peserta</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{summary.students}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Sudah Pernah Ujian</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{summary.activeStudents}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Admin</p>
            <p className="mt-2 text-2xl font-bold text-gray-950">{summary.admins}</p>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Daftar Akun</h2>
              <p className="mt-1 text-sm text-gray-500">
                Cari berdasarkan nama, email, atau nomor telepon.
              </p>
            </div>
            <div className="flex gap-2">
              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari user"
                InputProps={{
                  startAdornment: <Search className="mr-2 text-gray-400" fontSize="small" />,
                }}
              />
              <Button variant="contained" onClick={loadUsers}>
                Cari
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <CircularProgress />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-3">User</th>
                    <th className="px-3 py-3">Jenis Akun</th>
                    <th className="px-3 py-3">Kontak</th>
                    <th className="px-3 py-3">Pengerjaan</th>
                    <th className="px-3 py-3">Nilai Terakhir</th>
                    <th className="px-3 py-3">Rata-rata</th>
                    <th className="px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-950">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded border px-2 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{user.phoneNumber || "-"}</td>
                      <td className="px-3 py-3">{user.totalAttempts}</td>
                      <td className="px-3 py-3">{user.latestScore ?? "-"}</td>
                      <td className="px-3 py-3">{user.averageScore}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => setSelectedUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="secondary"
                            variant="outlined"
                            startIcon={<LockReset />}
                            onClick={() => setResetUser(user)}
                          >
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Akun Peserta</DialogTitle>
        <DialogContent>
          <div className="mt-2 grid gap-4">
            <TextField
              label="Nama"
              value={selectedUser?.username || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, username: event.target.value } : current
                )
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={selectedUser?.email || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, email: event.target.value } : current
                )
              }
              fullWidth
            />
            <TextField
              select
              label="Jenis Akun"
              value={selectedUser?.role || "siswa"}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, role: event.target.value } : current
                )
              }
              fullWidth
            >
              <MenuItem value="siswa">Siswa</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Nomor Telepon"
              value={selectedUser?.phoneNumber || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, phoneNumber: event.target.value } : current
                )
              }
              fullWidth
            />
            <TextField
              label="Pendidikan"
              value={selectedUser?.education || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, education: event.target.value } : current
                )
              }
              fullWidth
            />
            <TextField
              label="Jurusan"
              value={selectedUser?.major || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, major: event.target.value } : current
                )
              }
              fullWidth
            />
            <TextField
              label="Institusi Tujuan"
              value={selectedUser?.institution || ""}
              onChange={(event) =>
                setSelectedUser((current) =>
                  current ? { ...current, institution: event.target.value } : current
                )
              }
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Batal</Button>
          <Button variant="contained" disabled={saving} onClick={handleSaveUser}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(resetUser)}
        onClose={() => setResetUser(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <div className="mt-2">
            <p className="mb-4 text-sm text-gray-600">
              Password baru akan langsung aktif untuk akun{" "}
              <span className="font-semibold text-gray-950">{resetUser?.email}</span>.
            </p>
            <TextField
              label="Password Baru"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              fullWidth
              helperText="Minimal 8 karakter"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowPassword((current) => !current)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetUser(null)}>Batal</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={saving || newPassword.length < 8}
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
