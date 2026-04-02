'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsAPI, progressAPI } from '@/lib/api';
import type { ProgressStatus } from '@/types';

// ── Questions ──────────────────────────────────────────────
export function useQuestions(params?: {
  company?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => questionsAPI.getAll(params).then(r => r.data),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsAPI.getById(id).then(r => r.data.question),
    enabled: !!id,
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => questionsAPI.getCompanies().then(r => r.data.companies),
    staleTime: 5 * 60_000,
  });
}

// ── Progress ───────────────────────────────────────────────
export function useProgress(params?: { company?: string }) {
  return useQuery({
    queryKey: ['progress', 'stats', params],
    queryFn: () => progressAPI.getStats(params).then(r => r.data),
    staleTime: 30_000,
  });
}

export function useCompanyProgress() {
  return useQuery({
    queryKey: ['progress', 'companies'],
    queryFn: () => progressAPI.getCompanyProgress().then(r => r.data.companies),
    staleTime: 30_000,
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ['progress', 'activity'],
    queryFn: () => progressAPI.getActivity().then(r => r.data.activity),
    staleTime: 20_000,
  });
}

export function useDailyStats() {
  return useQuery({
    queryKey: ['progress', 'daily'],
    queryFn: () => progressAPI.getDailyStats().then(r => r.data.dailyStats),
    staleTime: 60_000,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => progressAPI.getBookmarks().then(r => r.data.bookmarks),
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────
export function useUpdateProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { questionId: string; status: ProgressStatus; notes?: string }) =>
      progressAPI.update(data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) =>
      progressAPI.toggleBookmark(questionId).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
