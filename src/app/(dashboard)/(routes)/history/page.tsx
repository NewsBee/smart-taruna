"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";

interface Attempt {
  id: number;
  score: number;
  testId: number;
  packageId: number;
  userId: number;
  createdAt: string;
  completedAt: string;
  User: {
    username: string;
    email: string;
  };
  Package: {
    title: string;
    id: number;
  };
  Test: {
    name: string;
  };
  email: string;
}

const StatisticsByQuiz: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleDownload = (attemptId: number) => {
    console.log("Download", attemptId);

    router.push(`/hasil/${attemptId}`);
  };

  const handleViewAttempt = (attemptId: number) => {
    console.log("View Attempt", attemptId);
    router.push(`/hasil/${attemptId}`);
    // Implement view attempt logic
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("api/hasil/byuser");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAttempts(data.attempt); // assuming the response has an 'attempt' field
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="px-10 pb-10">
      <h3 className="text-2xl font-semibold text-center my-3">History</h3>
      <div className="flex justify-between mb-4 flex-wrap">
        <h4 className="text-xl font-medium text-left mb-3 items-center">
          Tryout saya
        </h4>
        <div className="flex items-center w-full sm:w-auto">
          <div className="ml-4">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                router.push("/dashboard");
              }}
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 rounded px-8 py-6 transition-all flex flex-col lg:flex-row items-center justify-between mb-4">
        <h2
          style={{ maxWidth: 500 }}
          className="text-regular text-lg font-medium text-default whitespace-nowrap overflow-hidden text-ellipsis	break-all"
        >
          Pilih test
        </h2>
      </div>
      <TableContainer component={Paper} className="mt-4 mx-auto w-85%">
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Nama Ujian</TableCell>
              <TableCell>Nama Test</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Skor</TableCell>
              <TableCell>Tanggal Ujian</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attempts.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.Test.name}</TableCell>
                <TableCell>{row.Package.title}</TableCell>
                <TableCell>{row.User.email}</TableCell>
                <TableCell>{row.score}</TableCell>
                <TableCell>{row.completedAt}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    className="mr-2"
                    onClick={() => handleDownload(row.id)}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleViewAttempt(row.id)}
                  >
                    View Attempt
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StatisticsByQuiz;
