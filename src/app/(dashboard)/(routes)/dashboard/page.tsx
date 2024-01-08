"use client";

import { Button, CircularProgress, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { RiFilterFill } from "react-icons/ri";
import { QuizCard } from "../../_components/QuizCard";
import { useSession } from "next-auth/react";
import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from "next/navigation";
import { TestCard } from "../../_components/TestCard";

const globalColors = {
  brand: "#4f46e5",
  red: "#e11d48",
};

interface Test {
  id: number;
  title: string;
  name: string;
  // Tambahkan properti lain sesuai dengan struktur data test Anda
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);

    fetch("/api/test")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setTests(data.tests); // Set state with the array of tests
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pb-10 px-10">
      <h3 className="text-2xl font-semibold text-center my-3">Admin Dashboard</h3>
      <div className="flex justify-between mb-4 flex-wrap">
        <h4 className="text-xl font-medium text-left mb-3 items-center">
          Buat paket baru 
        </h4>
        <div className="flex items-center w-full sm:w-auto">
          {/* <Button variant="outlined" color="primary">
            + Create Quiz
          </Button> */}

          <div className="ml-4">
            <Button variant="outlined" color="primary" onClick={() => router.push(`/ujian`)}>
              Ujian
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-gray-200 rounded px-8 py-6 transition-all flex flex-col lg:flex-row items-center justify-between mb-4">
        <h2
          style={{ maxWidth: 500 }}
          className="text-regular text-lg font-medium text-default whitespace-nowrap overflow-hidden text-ellipsis	break-all"
        >
          Pilih jenis ujian
        </h2>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-10 pb-8">
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            {tests.map((test) => (
              <div
                className="w-full sm:w-1/2 md:w-1/3 lg:w-full p-4"
                key={test?.id}
              >
                <TestCard
                  className="w-full"
                  redirect={"/dashboard/" + test.name}
                  title={test.name}
                  status="aktif"
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
