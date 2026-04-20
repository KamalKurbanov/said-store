import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, reportsApi, transactionsApi, usersApi, restaurantsApi, UpdateTransactionRequest } from './api-client';

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export const useAuthMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    retry: false,
  });

// ─────────────────────────────────────────────────────────────
// P&L Reports
// ─────────────────────────────────────────────────────────────

export const useUploadReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => reportsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useReports = () =>
  useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list(),
  });

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────

export const useTransactions = () =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list(),
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:  transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>  transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const useExportTransactions = () =>
  useMutation({
    mutationFn: transactionsApi.exportExcel,
  });

// ─────────────────────────────────────────────────────────────
// Users (Admin)
// ─────────────────────────────────────────────────────────────

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'MODERATOR' | 'USER' }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// ─────────────────────────────────────────────────────────────
// Restaurants (Admin)
// ─────────────────────────────────────────────────────────────

export const useRestaurants = () =>
  useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantsApi.list,
  });

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      restaurantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};
