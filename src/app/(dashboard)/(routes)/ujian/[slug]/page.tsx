"use client";

import { Button, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { RiFilterFill } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { TestCard } from "../../../_components/TestCard";
import { usePackagesByTestName } from "@/app/(dashboard)/shared/queries";
import { DeleteModal } from "@/app/(dashboard)/_components/DeleteModal";
import { EmptyResponse } from "@/app/(dashboard)/_components/EmptyResponse";
import { QuizCard } from "@/app/(dashboard)/_components/QuizCard";
import { Loader } from "@/app/(dashboard)/_components/Svgs";
import { IQuiz } from "@/app/(dashboard)/shared/interfaces";
import { useRouter } from "next/navigation";

const globalColors = {
  brand: "#4f46e5",
  red: "#e11d48",
};

interface Test {
  name: string;
  id: number;
  title: string;

  // Tambahkan properti lain sesuai dengan struktur data test Anda
}

interface Package {
  id: number;
  testName: string;
  title: string;
  questions: Question[];
}

interface Question {
  id: number;
  content: string;
  type: string;
  packageId: number;
  image: string | null;
  explanation: string;
}

export default function PaketPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const { data, isLoading, isError, error } = usePackagesByTestName(
    params.slug
  );
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>();

  useEffect(() => {
    if (data) {
      setPackages(data.packages);
    }
  }, [data, params.slug]);

  return (
    <div className="pb-10 px-10">
      {/* <h3 className="text-2xl font-semibold text-center my-3">
        Ujian {data ? params.slug : null}{" "}
      </h3> */}
      {packages.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-center my-3">
            Ujian {params.slug}
          </h3>
        </div>
      )}
      <div className="flex justify-between mb-4 flex-wrap">
        <h4 className="text-xl font-medium text-left mb-3 items-center">
          My Quizes
        </h4>
        <div className="flex items-center w-full sm:w-auto">
          {/* <Button
          onClick={() => router.push(`/quizes/add`)}
          variant="contained"
          color="primary"
        >
          + Create Quiz
        </Button> */}

          <div className="ml-4">
            <Button
              onClick={() => router.push(`/dashboard/attempts`)}
              variant="outlined"
              color="primary"
            >
              History
            </Button>
          </div>
        </div>
      </div>
      {data && (
        <div className="bg-gray-200 rounded px-8 py-6 transition-all flex flex-col lg:flex-row items-center justify-between mb-4">
          <h2
            style={{ maxWidth: 500 }}
            className="text-regular text-lg font-medium text-default whitespace-nowrap overflow-hidden text-ellipsis	break-all"
          >
            {`${
              selectedQuiz
                ? `Selected Quiz : ${selectedQuiz.title}`
                : "Select a Quiz"
            }`}
          </h2>
        </div>
      )}
      {isLoading ? (
        <Loader halfScreen />
      ) : data ? (
        <div className="flex  flex-wrap gap-4 mt-10 pb-8">
          {packages.map((pkg) => (
            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/3 p-4 " key={pkg.id}>
              <QuizCard  _id={pkg.id.toString()} {...pkg} currTest={params.slug}  />
            </div>
          ))}
        </div>
      ) : (
        <EmptyResponse resource="Dashboard Quizes" />
      )}
    </div>
  );
}
