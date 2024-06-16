"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Button,
  Modal,
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  AppBar,
  Tabs,
  Tab,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useSession } from "next-auth/react";
import { makeStyles } from "@mui/styles";
import AdminPanel from "../../_components/AdminPanel";


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
  role: string;
  [key: string]: any;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface Package {
  id: number;
  title: string;
  description: string;
  type: string;
  isHidden: boolean;
  isLocked: boolean;
  questions: Question[];
}

interface Question {
  id: number;
  content: string;
}

interface UserResult {
  id: number;
  score: number;
  User: {
    username: string;
    email: string;
  };
  Package: Package;
}

const useStyles = makeStyles({
  appBar: {
    alignItems: 'center',
  },
  tabs: {
    justifyContent: 'center',
  },
  tab: {
    color: '#fff',
    '&.Mui-selected': {
      color: '#ff9800',
      backgroundColor: '#333',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
    },
  },
});

const UserProfile = () => {
  const classes = useStyles();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editedProfile, setEditedProfile] = useState<ProfileType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [packages, setPackages] = useState<Package[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [type, setType] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [date, setDate] = useState("");

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
        console.error("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, []);


  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

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

      setProfile(editedProfile);
      setIsEditModalOpen(false);

      setSnackbar({
        open: true,
        message: "Profil berhasil diperbarui!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Gagal memperbarui profil.",
        severity: "error",
      });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [name]: value,
      });
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

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

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (response.ok) {
        setProfile((prevProfile: any) => ({
          ...prevProfile,
          avatar: data.path,
        }));
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
      fileInputRef.current.click();
    }
  };

  if (!profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card className="mb-4 shadow-lg" style={{ height: '100%' }}>
            <CardContent>
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
                  style={{ width: 96, height: 96 }}
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
                  </TableBody>
                </Table>
              </TableContainer>
              <div className="mt-4">
                <Button variant="text" onClick={handleEditClick}>
                  Edit Profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card className="shadow-lg mb-4" style={{ flex: 1 }}>
            <CardContent
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
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

          <Card className="shadow-lg" style={{ flex: 1 }}>
            <CardContent
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
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
              <LineChart width={400} height={300} data={profile.tryOutStatsTPA}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highestTPA"
                  stroke="#8884d8"
                  name="Highest TPA"
                />
                <Line
                  type="monotone"
                  dataKey="averageTPA"
                  stroke="#82ca9d"
                  name="Average TPA"
                />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {session?.user.role === "admin" && (
        <AdminPanel
          userResults={userResults}
          setUserResults={setUserResults}
          type={type}
          setType={setType}
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
          date={date}
          setDate={setDate}
          packages={packages}
          setPackages={setPackages}
        />
      )}

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
            <Button onClick={handleSaveChanges} variant="outlined">
              Simpan Perubahan
            </Button>
          </form>
        </Box>
      </Modal>

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
