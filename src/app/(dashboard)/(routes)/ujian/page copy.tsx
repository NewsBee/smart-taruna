"use client";

import { Button, IconButton } from "@material-ui/core";
import * as React from "react";
import { useState } from "react";
import { FcClearFilters } from "react-icons/fc";
import { RiFilterFill } from "react-icons/ri";
import { EmptyResponse } from "../../_components/EmptyResponse";
import { ErrorMessage } from "../../_components/ErrorMessage";
import { FiltersForm } from "../../_components/forms/FiltersForm";
import { ModalSkeleton } from "../../_components/Modal";
import { QuizCard } from "../../_components/QuizCard";
import { Loader } from "../../_components/Svgs";
import { globalColors } from "../../shared/constants";
import { IQuiz } from "../../shared/interfaces";
import { useQuizes } from "../../shared/queries";
import { endpoints } from "../../shared/urls";

export default function Quizes() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading, isFetching, isSuccess, error } = useQuizes(
    `${endpoints.quizes}?search=${encodeURIComponent(
      searchTerm
    )}&tag=${encodeURIComponent(tag)}&page=${currentPage}`,
    ["Quizes", searchTerm, tag, currentPage]
  );

  const [filtersOpen, setFiltersOpen] = useState(false);
  const handleFiltersOpen = () => setFiltersOpen(true);
  const handleFiltersClose = () => setFiltersOpen(false);

  const clearFilters = () => {
    setSearchTerm("");
    setTag("");
  };

  React.useEffect(() => {
    if (isSuccess) {
      setTotalPages(data.count ? Math.ceil(data.count / 6) : 1);
    }
  }, [data?.count, isSuccess]);

  if (error?.response?.status) {
    return (
      <ErrorMessage
        message={error.response.data.message}
        statusCode={error.response.status}
      />
    );
  }

  return (
    <div className="pb-10">
      <div className="flex justify-center">
        <h3 className="text-2xl font-semibold text-center my-3">All Quizes</h3>
        {/* <div className="flex items-center justify-center ml-3">
          <IconButton onClick={handleFiltersOpen} aria-label="Filters">
            <RiFilterFill fill={globalColors.brand} size={25} />
          </IconButton>
          {(searchTerm || tag) && (
            <IconButton onClick={clearFilters} aria-label="Filters">
              <FcClearFilters size={25} fill={globalColors.red} />
            </IconButton>
          )}
        </div> */}
      </div>

      {isLoading || isFetching ? (
        <Loader halfScreen />
      ) : data?.tests.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-7 pb-8 px-8">
          {data?.tests.map((quiz:IQuiz) => (
            <QuizCard key={quiz.id} {...quiz} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyResponse
            resource={
              searchTerm || tag
                ? "All Active Filtered Quizes"
                : "All Active Quizes"
            }
          />
        </div>
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
      <ModalSkeleton open={filtersOpen} onClose={handleFiltersClose}>
        <FiltersForm
          modalClose={handleFiltersClose}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setTag={setTag}
          tag={tag}
        />
      </ModalSkeleton>
    </div>
  );
}
