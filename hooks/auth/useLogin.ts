// hooks/auth/useLogin.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as authService from "@/services/auth.service";

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: authService.login,

    onSuccess: () => {
      // Refresh session everywhere
      queryClient.invalidateQueries({
        queryKey: ["session"],
      });
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess:mutation.isSuccess
  };
}
