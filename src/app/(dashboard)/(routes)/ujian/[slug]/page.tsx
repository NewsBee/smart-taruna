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
  duration?: number;
  isLocked: boolean;
  isHidden: boolean;
}

interface Question {
  id: number;
  content: string;
  type: string;
  packageId: number;
  image: string | null;
  explanation: string;
}

interface PackageDetail {
  totalQuestions: number;
  highestScore: number;
  attemptCount: number;
  duration: number;
  // Include other relevant properties of package details
}

async function fetchPackageDetails(packageId: any) {
  // Replace with the correct API endpoint and add authorization if needed
  const response = await fetch(`/api/paket/info/${packageId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch package details");
  }
  return response.json();
}

export default function PaketPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tests, setTests] = useState<Test[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const { data, isLoading, isError, error } = usePackagesByTestName(
    params.slug,
    params.slug
  );
  const [selectedQuiz, setSelectedQuiz] = useState<IQuiz | null>();
  const [packageDetails, setPackageDetails] = useState<{
    [key: number]: PackageDetail;
  }>({});

  // useEffect(() => {
  //   if (data) {
  //     setPackages(data.packages);
  //   }
  // }, [data, params.slug]);

  useEffect(() => {
    if (data) {
      setPackages(data.packages);
    }
    async function loadPackageDetails() {
      if (data && data.packages) {
        try {
          const detailsPromises = data.packages.map((pkg: Package) =>
            fetchPackageDetails(pkg.id)
          );
          const details = await Promise.all(detailsPromises);
          const detailsMap = details.reduce((acc, detail) => {
            acc[detail.packageId] = detail;
            return acc;
          }, {});
          setPackageDetails(detailsMap);
        } catch (error) {
          console.error("Error fetching package details:", error);
        }
      }
    }

    loadPackageDetails();
    // if (data.length > 0) {
    // }
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
          Tryout saya
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
              onClick={() => router.push(`/history`)}
              variant="outlined"
              color="primary"
            >
              History
              {/* {console.log(packageDetails[1])} */}
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
                : "Pilih Paket"
            }`}
          </h2>
        </div>
      )}
      {isLoading ? (
        <Loader halfScreen />
      ) : data ? (
        <div className="mt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages
            .filter((pkg) => !pkg.isHidden) // Hanya menampilkan paket yang tidak disembunyikan
            .map((pkg) => {
              // Access detail for each package
              const detail = packageDetails[pkg.id];

              const cardClass = pkg.isLocked
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer";

              // console.log(pkg.isLocked)
              // console.log(pkg.isHidden)

              return (
                <div className={`p-4 ${cardClass}`} key={pkg.id}>
                  {/* <p>{detail ? detail.totalQuestions : 'Loading...'}</p>
                <p>{detail ? detail.highestScore : 'Loading...'}</p> */}
                  <QuizCard
                    status="active"
                    description="No desc available"
                    tags={["kedinasan"]}
                    questionsCount={detail?.totalQuestions}
                    score={detail?.highestScore}
                    attemptsCount={detail?.attemptCount}
                    _id={pkg.id.toString()}
                    {...pkg}
                    currTest={params.slug}
                    id={pkg.id.toString()}
                    disabled={pkg.isLocked}
                    // duration={detail?.duration}
                  />
                </div>
              );
            })}
        </div>
      ) : (
        <EmptyResponse resource="Dashboard Quizes" />
      )}
    </div>
  );
}
