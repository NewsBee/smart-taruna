"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Link,
  Grid,
  Button,
  Modal,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ProfileType {
  avatar: string;
  username: string;
  profileImage: string;
  email: string;
  phoneNumber: string;
  lastEducation: string;
  major: string;
  destinationInstitution: string;
  socialLinks: Array<{ platform: string; link: string }>;
  tryOutStatsSKD: Array<{ name: string; value: number }>;
  tryOutStatsTPA: Array<{ name: string; value: number }>;
  [key: string]: any; // Untuk properti dinamis lainnya
}

const UserProfile = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editedProfile, setEditedProfile] = useState<ProfileType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // atau 'error', bergantung pada situasi
  });

  const toggleHover = (value: any) => () => {
    setIsHovered(value);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.userProfile);
        setEditedProfile(data.userProfile);
      } else {
        // Handle error atau setel state error jika perlu
        console.error("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, []);

  // Fungsi untuk membuka modal pengeditan
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // Fungsi untuk menutup modal pengeditan
  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  // Fungsi untuk menyimpan perubahan data
  const handleSaveChanges = async () => {
    if (!editedProfile) return;

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setProfile(editedProfile); // Update state dengan data profil terbaru
      setIsEditModalOpen(false); // Tutup modal

      // Tampilkan notifikasi sukses
      setSnackbar({
        open: true,
        message: "Profil berhasil diperbarui!",
        severity: "success",
      });
    } catch (error: any) {
      // Tampilkan notifikasi error
      setSnackbar({
        open: true,
        message: error.message || "Gagal memperbarui profil.",
        severity: "error",
      });
    }
  };

  // Fungsi untuk mengupdate data yang diubah dalam modal
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (editedProfile) {
      // Pastikan editedProfile tidak null
      setEditedProfile({
        ...editedProfile,
        [name]: value,
      });
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi ukuran file (contoh: max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "Ukuran file terlalu besar. Maksimum adalah 5MB.",
        severity: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/profile/uploadprofile", {
        method: "POST",
        body: formData,
      });

      console.log(response)

      if (!response.ok) {
        // Jika status response bukan OK, langsung tolak dengan status dan statusText
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (response.ok) {
        // Update state profil dengan URL gambar baru atau lakukan fetch profil terbaru
        setProfile((prevProfile: any) => ({
          ...prevProfile,
          avatar: data.path, // Perbarui path avatar di state profile
        }));
        // console.log("Foto profil berhasil diperbarui", data);
        setSnackbar({
          open: true,
          message: "Foto profil berhasil diperbarui!",
          severity: "success",
        });
      } else {
        throw new Error(data.message || "Gagal mengganti foto profil");
      }
    } catch (error: any) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message || "Gagal mengganti foto profil.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (event: any, reason: any) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbar({ ...snackbar, open: false });
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      // Pengecekan eksplisit
      fileInputRef.current.click();
    }
  };

  const tryOutStats = [
    { name: "TO 1", highestSKD: 320, averageSKD: 280 },
    { name: "TO 2", highestSKD: 340, averageSKD: 300 },
    { name: "TO 3", highestSKD: 350, averageSKD: 310 },
    { name: "TO 4", highestSKD: 360, averageSKD: 320 },
  ];

  if (!profile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  // console.log(profile.profileImage);

  return (
    <div className="container mx-auto p-4">
      <Grid container spacing={2}>
        {/* Informasi Pengguna */}
        <Grid item xs={12} md={6}>
          <Card className="mb-4 shadow-lg">
            <CardContent>
              {/* Foto Profil */}
              <Box
                onMouseEnter={toggleHover(true)}
                onMouseLeave={toggleHover(false)}
                position="relative"
                display="inline-block"
                onClick={handleAvatarClick}
                style={{ cursor: "pointer" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
                <Avatar
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-24 h-24 mx-auto mb-4"
                  style={{ width: 96, height: 96 }} // Sesuaikan ukuran sesuai kebutuhan
                />
                {isHovered && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgcolor="rgba(0, 0, 0, 0.5)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="50%"
                  >
                    <Typography variant="body2" color="white">
                      Ganti
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* Data diri dalam tabel */}
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Nama
                      </TableCell>
                      <TableCell>{profile.username}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Email
                      </TableCell>
                      <TableCell>{profile.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Nomor Telepon
                      </TableCell>
                      <TableCell>{profile.phoneNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Pendidikan Terakhir
                      </TableCell>
                      <TableCell>{profile.lastEducation}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Jurusan
                      </TableCell>
                      <TableCell>{profile.major}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Institusi Tujuan
                      </TableCell>
                      <TableCell>{profile.destinationInstitution}</TableCell>
                    </TableRow>
                    {/* Tambahkan baris untuk data diri tambahan */}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Tombol Edit Profil */}
              <div className="mt-4">
                <Button variant="text" onClick={handleEditClick}>
                  Edit Profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistik Try Out */}
        <Grid item xs={12} md={6}>
          <Card className="shadow-lg">
            <CardContent
              style={{
                display: "flex",
                flexDirection: "column",
                justifyItems: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6" className="font-bold mb-2">
                Try Out Statistics SKD
              </Typography>
              <Typography variant="body2" style={{ marginBottom: 16 }}>
                Data yang ditampilkan adalah nilai tertinggi dan rata-rata tes
                SKD dari 4 tes terakhir.
              </Typography>
              <LineChart width={400} height={300} data={profile.tryOutStatsSKD}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highestSKD"
                  stroke="#8884d8"
                  name="Highest SKD"
                />
                <Line
                  type="monotone"
                  dataKey="averageSKD"
                  stroke="#82ca9d"
                  name="Average SKD"
                />
              </LineChart>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent
              style={{
                display: "flex",
                flexDirection: "column",
                justifyItems: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography variant="h6" className="font-bold mb-2">
                Try Out Statistics TPA
              </Typography>
              <Typography variant="body2" style={{ marginBottom: 16 }}>
                Data yang ditampilkan adalah nilai tertinggi dan rata-rata tes
                TPA dari 4 tes terakhir.
              </Typography>
              <br />
              <LineChart width={400} height={300} data={profile.tryOutStatsTPA}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highestSKD"
                  stroke="#8884d8"
                  name="Highest SKD"
                />
                <Line
                  type="monotone"
                  dataKey="averageSKD"
                  stroke="#82ca9d"
                  name="Average SKD "
                />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal Pengeditan Profil */}
      <Modal open={isEditModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Edit Profil
          </Typography>
          <form>
            <TextField
              className="mt-2"
              label="Nama"
              fullWidth
              name="username"
              value={editedProfile ? editedProfile.username : ""}
              onChange={handleInputChange}
            />
            <TextField
              className="mt-2"
              label="Email"
              fullWidth
              name="email"
              value={editedProfile ? editedProfile.email : ""}
              onChange={handleInputChange}
              disabled
            />
            <TextField
              className="mt-2"
              label="Nomor"
              fullWidth
              name="phoneNumber"
              value={editedProfile ? editedProfile.phoneNumber : ""}
              onChange={handleInputChange}
            />
            <TextField
              className="mt-2"
              label="Pendidikan terakhir"
              fullWidth
              name="lastEducation"
              value={editedProfile ? editedProfile.lastEducation : ""}
              onChange={handleInputChange}
            />
            <TextField
              className="mt-2"
              label="Jurusan"
              fullWidth
              name="major"
              value={editedProfile ? editedProfile.major : ""}
              onChange={handleInputChange}
            />
            <TextField
              className="mt-2"
              label="Tujuan"
              fullWidth
              name="destinationInstitution"
              value={editedProfile ? editedProfile.destinationInstitution : ""}
              onChange={handleInputChange}
            />
            {/* Tambahkan input lain sesuai kebutuhan */}
            <Button onClick={handleSaveChanges} variant="outlined">
              Simpan Perubahan
            </Button>
          </form>
        </Box>
      </Modal>
      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      /> */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
