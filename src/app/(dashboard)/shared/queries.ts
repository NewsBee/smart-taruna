import axios, { AxiosError, AxiosResponse } from "axios";
import { useSession } from "next-auth/react";
import {
  MutationOptions,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { getToken } from "next-auth/jwt";

interface UpdateQuestionData {
  content: string;
  type: string;
  explanation: string;
  Choices: {
    id: number;
    content: string;
    isCorrect: boolean;
    scoreValue: number;
  }[];
}

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
// export const useQuizQuestions = (testId: any) => {
//   return useQuery(["quizQuestions", testId], async () => {
//     try {
//       const { data } = await axios.get(`/api/test/${testId}/questions`);
//       return data;
//     } catch (error) {
//       // console.log(error)
//       throw new Error('Gagal mengambil data');
//     }
//     // const { data } = await axios.get(`/api/test/${testId}/questions`);
//     // return data;
//   });
// };

export const useQuizQuestions = (testId: any) => {
  return useQuery(["quizQuestions", testId], async () => {
    try {
      const { data } = await axios.get(`/api/test/${testId}/questions`);
      // console.log(data); // Tambahkan ini
      return data;
    } catch (error) {
      console.error(error);
      throw new Error('Gagal mengambil data');
    }
  }, {
    // Jika Anda ingin memastikan data selalu fresh, Anda bisa menambahkan opsi refetchOnWindowFocus
    refetchOnWindowFocus: true,
  });
};

export const useQuizes = (url: string, queryKey: QueryKey) => {
  return QueryFactory(queryKey, url);
};

export const useQuiz = (testId: any) => {
  return useQuery(["quiz", testId], async () => {
    try {
      const { data } = await axios.get(`/api/test/${testId}/quiz`);
      // console.log(data); // Tambahkan ini
      return data;
    } catch (error) {
      console.error(error);
      throw new Error('Gagal mengambil data');
    }
  });
};

export const useMyAttemptById = (id:any, options = {}) => {
  return useQuery(["Attempts", id], async () => {
    const { data } = await axios.get(`/api/hasil/${id}`);
    return data;
  }, options);
};

export const usePackagesByTestName = (testName:any,refreshData:any, options = {}) => {
  return QueryFactory(
    ["Packages", testName, refreshData],
    `/api/paket/${testName}`,
    options
  );
};

export const usePackageStats  = (testName:any, options = {}) => {
  return QueryFactory(
    ["Packages", testName],
    `/api/paket/info/${testName}`,
    options
  );
};

export const useTestStats = (testName:any) => {
  return useQuery(['testStats', testName], async () => {
    const { data } = await axios.get(`/api/paket/info/${testName}`);
    return data;
  });
};

// export const useUserAttempts = () => {
//   return useQuery(['userAttempts', userId], async () => {
//     const { data } = await axios.get(`/api/hasil/byuser`);
//     return data;
//   });
// };

export const useCreatePackage = () => {
  return useMutation(
    async (data) => {
      return axios.post('/api/paket/create', data);
    }
  );
};

export const useCreatePaket = (options?: MutationOptions) => MutationFactory('Create Package', '/api/paket/create', 'POST', options)
// export const useDeleteQuiz = (options?: MutationOptions) => DeleteMutationFactory('Delete Package', '/api/paket/delete', options)
export const useDeleteQuiz = (options?: UseMutationOptions<any, AxiosError, { id: number }>) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError, { id: number }>(
    ({ id }) => axios.delete(`/api/paket/delete`, { data: { id } }),
    {
      ...options,
      onSuccess: () => {
        // Invalidate and refetch data
        queryClient.invalidateQueries('Quizes');
      },
      onError: (error: AxiosError) => {
        // Optionally, handle the error here
        // console.error('Error deleting quiz:', error.response?.data?.message || error.message);
      }
    }
  );
};

// export const useCreateQuestion = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     (newQuestionData) => axios.post('/api/pertanyaan/create', newQuestionData),
//     {
//       onSuccess: () => {
//         // Invalidate dan refetch data pertanyaan
//         queryClient.invalidateQueries('Quiz Questions');
//       },
//     }
//   );
// };
// export const useCreateQuestion = (id: number, options?: MutationOptions) => MutationFactory('Create Question', `/api/test/${id}/questions`, 'POST', options)
// export const useDeleteQuestion = (quizId: number, options?: MutationOptions) => DeleteMutationFactory('Delete Question', `/api/test/${quizId}/questions`, options)

export const useDeleteQuestion = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (deleteData: { id: number }) => {
      const response = await axios.delete(`/api/test/${quizId}/questions`, {
        data: deleteData
      });
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate dan refetch
        queryClient.invalidateQueries(["quizQuestions", quizId]);
      },
    }
  );
};

export const useCreateQuestion = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (newQuestionData: any) => {
      const response = await axios.post(`/api/test/${quizId}/questions`, newQuestionData);
      return response.data;
    },
    {
      onSuccess: () => {
        // Invalidate dan refetch
        queryClient.invalidateQueries(["quizQuestions", quizId.toString()]);
      },
      onError: (error) => {
        // Handle error
        console.error('Error updating question:', error);
      }
    }
  );
};

export const useUpdateQuestion = (quizId:any) => {
  const queryClient = useQueryClient();

  return useMutation(
    (updatedData:any) => axios.put(`/api/test/${quizId}/quiz`, updatedData),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(['quiz']);
      },
      onError: (error) => {
        // Handle error
        console.error('Error updating question:', error);
      }
    }
  );
};