import axios, { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import {
  MutationOptions,
  QueryKey,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "react-query";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export const PublicQueryFactory = (
  queryKey: QueryKey,
  url: string,
  options?: UseQueryOptions<any, AxiosError, any>
) => {
  return useQuery<any, AxiosError, any>(
    queryKey,
    async () => {
      return axios({
        url,
        method: "GET",
      }).then((result: AxiosResponse) => result.data);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      ...options,
    }
  );
};

export const QueryFactory = (
  queryKey: QueryKey,
  url: string,
  options?: UseQueryOptions<any, AxiosError, any>
) => {
  return useQuery<any, AxiosError, any>(
    queryKey,
    async () => {
      return axios({
        url,
        method: "GET",
      }).then((result: AxiosResponse) => result.data);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      ...options,
    }
  );
};

const MutationFactory = (
  mutationKey: QueryKey,
  url: string,
  method: "POST" | "PUT" | "PATCH",
  options?: MutationOptions
) => {
  return useMutation<any, AxiosError, any>({
    mutationKey,
    mutationFn: async (variables: { body: any }) => {
      return axios({
        url,
        method,
        data: variables.body,
      }).then((response: AxiosResponse) => response.data);
    },
    ...options,
  });
};

const DeleteMutationFactory = (
  mutationKey: QueryKey,
  url: string,
  options?: MutationOptions
) => {
  return useMutation<any, AxiosError, any>({
    mutationKey,
    mutationFn: async () => {
      return axios({
        url,
        method: "DELETE",
      }).then((response: AxiosResponse) => response.data);
    },
    ...options,
  });
};

// Contoh fungsi untuk mengambil data soal berdasarkan id test
export const useQuizQuestions = (testId: any) => {
  return useQuery(["quizQuestions", testId], async () => {
    const { data } = await axios.get(`/api/test/${testId}/questions`);
    return data;
  });
};

export const useQuizes = (url: string, queryKey: QueryKey) => {
  return QueryFactory(queryKey, url);
};

export const useMyAttemptById = (id:any, options = {}) => {
  return useQuery(["Attempts", id], async () => {
    const { data } = await axios.get(`/api/hasil/${id}`);
    return data;
  }, options);
};

export const usePackagesByTestName = (testName:any, options = {}) => {
  return QueryFactory(
    ["Packages", testName],
    `/api/paket/${testName}`,
    options
  );
};
