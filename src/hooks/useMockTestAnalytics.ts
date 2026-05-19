import { useCallback, useEffect, useState } from 'react';
import { mockApi } from '@/api';
import { apiError } from '@/lib/apiError';
import { filterMocksByType } from '@/lib/mockClassification';
import type { MockAnalytics, MockTest } from '@/types';
import type { MockTestFormPayload } from '@/components/mock/MockTestForm';
import toast from 'react-hot-toast';

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
  const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([mockApi.analytics(testType), mockApi.list(testType)])
      .then(([a, m]) => {
        const filteredMocks = filterMocksByType(m.data, testType);
        setAnalytics({
          ...a.data,
          total_mocks: filteredMocks.length,
          ...(testType === 'sectional'
            ? { target_analytics: undefined, target_insights: [] }
            : {}),
        });
        setMocks(filteredMocks);
      })
      .catch((err) =>
        toast.error(
          apiError(
            err,
            testType === 'full' ? 'Failed to load full mock analytics' : 'Failed to load sectional analytics'
          )
        )
      )
      .finally(() => setLoading(false));
  }, [testType]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (payload: MockTestFormPayload) => {
    setSaving(true);
    try {
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
      });
      toast.success(testType === 'full' ? 'Full mock saved!' : 'Sectional saved!');
      setShowForm(false);
      load();
      onSaved?.();
    } catch (err) {
      toast.error(
        apiError(err, testType === 'full' ? 'Failed to save full mock' : 'Failed to save sectional')
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMock = async (id: number) => {
    const label = testType === 'full' ? 'full mock' : 'sectional';
    if (!window.confirm(`Delete this ${label} record?`)) return;
    try {
      await mockApi.delete(id);
      toast.success('Deleted');
      load();
      onSaved?.();
    } catch {
      toast.error('Could not delete');
    }
  };

  return {
    analytics,
    mocks,
    showForm,
    setShowForm,
    saving,
    loading,
    submit,
    deleteMock,
    load,
  };
}
