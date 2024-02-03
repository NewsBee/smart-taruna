"use client";

import { Button, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { RiFilterFill } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { getAccessToken } from "@auth0/nextjs-auth0";
import { TestCard } from "../../../_components/TestCard";
import {
  useDeleteQuiz,
  usePackagesByTestName,
} from "@/app/(dashboard)/shared/queries";
import { DeleteModal } from "@/app/(dashboard)/_components/DeleteModal";
import { EmptyResponse } from "@/app/(dashboard)/_components/EmptyResponse";
import { QuizCard } from "@/app/(dashboard)/_components/QuizCard";
import { Loader } from "@/app/(dashboard)/_components/Svgs";
import { IQuiz } from "@/app/(dashboard)/shared/interfaces";
import { useRouter } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import LockUnlockButton from "@/app/(dashboard)/_components/LockUnlockButton";

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
  isLocked: boolean; // Menambahkan properti isLocked
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
  const [refreshData, setRefreshData] = useState(false);
  const { data, isLoading, isError, error, refetch  } = usePackagesByTestName(
    params.slug,
    refreshData
  );
  const [selectedQuiz, setSelectedQuiz] = useState<Package | null>();
  const [packageDetails, setPackageDetails] = useState<{
    [key: number]: PackageDetail;
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalActive, setDeleteModalActive] = useState(false);
  const handleDeleteModalOpen = () => setDeleteModalActive(true);
  const handleDeleteModalClose = () => setDeleteModalActive(false);
  // console.log(selectedQuiz)

  const {
    mutateAsync: deleteQuiz,
    isLoading: IsDeleteCampaignLoading,
    reset,
  } = useDeleteQuiz();

  const handleDelete = async (id: number) => {
    if (id !== undefined) {
      try {
        await deleteQuiz({ id });
        enqueueSnackbar("Paket berhasil dihapus", { variant: "success" });
        setRefreshData((prev) => !prev); // Toggle to trigger re-fetch
      } catch (error) {
        enqueueSnackbar("Gagal menghapus paket", { variant: "error" });
      } finally {
        handleDeleteModalClose();
      }
    } else {
      enqueueSnackbar("ID Paket tidak valid", { variant: "error" });
    }
  };



  useEffect(() => {
    if (data) {
      setPackages(data.packages);
      setTotalPages(data.count ? Math.ceil(data.count / 6) : 1);
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
  }, [data, params.slug, refreshData]);

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
          Paket saya
        </h4>
        <div className="flex items-center w-full sm:w-auto">
          <Button
            onClick={() => router.push(`/dashboard/${params.slug}/create`)}
            variant="outlined"
            color="primary"
          >
            + Buat Paket
          </Button>

          <div className="ml-4">
            <Button
              onClick={() => router.push(`/dashboard`)}
              variant="outlined"
              color="primary"
            >
              Kembali
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
                ? `Peket yang dipilih : ${selectedQuiz.title}`
                : "Pilih paket"
            }`}
          </h2>
          <div className="mt-6 lg:mt-0">
            {selectedQuiz && (
              <div className="flex flex-wrap">
                {/* <div className="mr-4">
                <Button
                  onClick={() =>
                    router.push(`/statistics/quiz/${selectedQuiz._id}`)
                  }
                  className="mr-6"
                >
                  Statistics
                </Button>
              </div> */}
                <div className="mr-4">
                  <Button className="mr-6">Hide</Button>
                </div>
                <div className="mr-4">
                  <Button className="mr-6">Lock</Button>
                </div>
                <div className="mr-4">
                  <Button className="mr-6">Update</Button>
                </div>
                <div className="mr-4">
                  <Button onClick={handleDeleteModalOpen} variant="text">
                    Delete
                  </Button>
                </div>

                <Button
                  variant="outlined"
                  color="info"
                  onClick={() =>
                    router.push(`/dashboard/${params.slug}/${selectedQuiz.id}`)
                  }
                >
                  + Add/Update Paket
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading ? (
        <Loader halfScreen />
      ) : data ? (
        <div className="mt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg: any) => {
            // Access detail for each package
            const detail = packageDetails[pkg.id];
            return (
              <div className="p-4" key={pkg.id}>
                {/* <p>{detail ? detail.totalQuestions : 'Loading...'}</p>
                <p>{detail ? detail.highestScore : 'Loading...'}</p> */}
                <QuizCard
                  status="active"
                  description="No desc available"
                  tags={["kedinasan"]}
                  onSelect={() => setSelectedQuiz(pkg)}
                  questionsCount={detail?.totalQuestions}
                  score={detail?.highestScore}
                  attemptsCount={detail?.attemptCount}
                  _id={pkg.id.toString()}
                  {...pkg}
                  currTest={params.slug}
                  selected={selectedQuiz?.id === pkg.id}
                />
                <div className="mt-2 ml-2">
                  {/* <Button
                    onClick={() => handleLockUnlock(pkg.id, pkg.isLocked)}
                  >
                    {pkg.isLocked ? "Buka Kunci" : "Kunci"}
                  </Button> */}
                  <LockUnlockButton packageId={pkg.id} isLocked={pkg.isLocked} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyResponse resource="Dashboard Quizes" />
      )}
      <div>
        {totalPages > 1 &&
          Array.from(Array(totalPages).keys()).map((loader, index) => (
            <Button
              color="primary"
              variant={currentPage - 1 === index ? "contained" : "text"}
              key={index}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
      </div>
      {deleteModalActive && (
        <DeleteModal
          deleteLoading={IsDeleteCampaignLoading}
          deleteModalActive={deleteModalActive}
          handleDeleteModalClose={handleDeleteModalClose}
          onDelete={() => handleDelete(selectedQuiz?.id || 0)}
          resource="Paket"
        />
      )}
    </div>
  );
}
