import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, reportsApi, transactionsApi } from '../api/api-client';

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data);
    },
  });
}

// ─────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.list,
  });
}

export function useUploadReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useSampleReport() {
  return useQuery({
    queryKey: ['sample-report'],
    queryFn: () => reportsApi.sample().then((r) => r.pnl),
  });
}

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.list,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
