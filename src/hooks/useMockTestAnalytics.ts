import { useState } from 'react';
import { mockApi, roadmap2026Api } from '@/api';
import { apiError } from '@/lib/apiError';
import { filterMocksByType } from '@/lib/mockClassification';
import { consumeRoadmapMockIntent } from '@/lib/roadmapMockFlow';
import type { MockAnalytics } from '@/types';
import type { MockTestFormPayload } from '@/components/mock/MockTestForm';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

function toSectionPayload(s: MockTestFormPayload['reasoning']) {
  return {
    max_marks: s.max_marks,
    secured_marks: s.secured_marks,
    total_questions: s.total_questions,
    attempted: s.attempted,
    correct: s.correct,
    wrong: s.wrong,
  };
}

export function useMockTestAnalytics(testType: 'full' | 'sectional', onSaved?: () => void) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mock-analytics', testType],
    queryFn: async () => {
      const [a, m] = await Promise.all([mockApi.analytics(testType), mockApi.list(testType)]);
      const filteredMocks = filterMocksByType(m.data, testType);
      const analytics: MockAnalytics = {
        ...a.data,
        total_mocks: filteredMocks.length,
        ...(testType === 'sectional' ? { target_analytics: undefined, target_insights: [] } : {}),
      };
      return { analytics, mocks: filteredMocks };
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: MockTestFormPayload) =>
      await mockApi.create({
        test_name: payload.test_name,
        test_date: payload.test_date,
        test_type: payload.test_type,
        max_score: payload.max_score,
        total_score: payload.total_score,
        total_questions: payload.total_questions,
        attempted: payload.attempted,
        correct: payload.correct,
        wrong: payload.wrong,
        negative_marks: payload.negative_marks,
        reasoning: toSectionPayload(payload.reasoning),
        quant: toSectionPayload(payload.quant),
        english: toSectionPayload(payload.english),
        gk: toSectionPayload(payload.gk),
      }),
    onSuccess: async (_data, payload) => {
      toast.success(testType === 'full' ? 'Full mock saved!' : 'Sectional saved!');
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ['mock-analytics', testType] });
      await queryClient.invalidateQueries({ queryKey: ['target-analytics'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      if (testType === 'full') {
        const intent = consumeRoadmapMockIntent();
        if (intent) {
          const attempted = payload.attempted || 0;
          const correct = payload.correct || 0;
          const accuracy =
            attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : undefined;
          try {
            await roadmap2026Api.updateTask(intent.week, intent.taskKey, {
              completed: true,
              score: payload.total_score,
              accuracy: typeof accuracy === 'number' ? accuracy : undefined,
            });
            await queryClient.invalidateQueries({ queryKey: ['roadmap-2026'] });
            toast.success('Roadmap updated — mock marked complete');
          } catch {
            /* mock saved; roadmap sync optional */
          }
        }
      }

      onSaved?.();
    },
    onError: (err) => {
      toast.error(
        apiError(err, testType === 'full' ? 'Failed to save full mock' : 'Failed to save sectional')
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await mockApi.delete(id),
    onSuccess: async () => {
      toast.success('Deleted');
      await queryClient.invalidateQueries({ queryKey: ['mock-analytics', testType] });
      onSaved?.();
    },
    onError: () => {
      toast.error('Could not delete');
    },
  });

  const submit = async (payload: MockTestFormPayload): Promise<void> => {
    await submitMutation.mutateAsync(payload);
  };

  const deleteMock = async (id: number) => {
    const label = testType === 'full' ? 'full mock' : 'sectional';
    if (!window.confirm(`Delete this ${label} record?`)) return;
    await deleteMutation.mutateAsync(id);
  };

  return {
    analytics: data?.analytics ?? null,
    mocks: data?.mocks ?? [],
    showForm,
    setShowForm,
    saving: submitMutation.isPending,
    loading: isLoading,
    submit,
    deleteMock,
    load: async () => {
      await refetch();
    },
  };
}
