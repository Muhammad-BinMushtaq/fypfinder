// hooks/auth/useSignup.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authService from "@/services/auth.service";

export function useSignup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.signup,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });

  return {
    signup: mutation.mutate,
    signupAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
   isError: mutation.isError,
   isSuccess: mutation.isSuccess,
  };
}
