import { useOutletContext } from 'react-router-dom';
import { MockTestForm } from '@/components/mock/MockTestForm';
import { FullMockAnalyticsView } from '@/components/mock/FullMockAnalyticsView';
import { GlassCard } from '@/components/ui/GlassCard';
import { useMockTestAnalytics } from '@/hooks/useMockTestAnalytics';

interface LayoutContext {
  refreshStats?: () => void;
}

export function AnalyticsPage() {
  const { refreshStats } = useOutletContext<LayoutContext>();
  const { analytics, mocks, showForm, setShowForm, saving, loading, submit, deleteMock, load } =
    useMockTestAnalytics('full', refreshStats);

  if (loading && !analytics) {
    return (
      <div className="space-y-4 max-w-6xl animate-pulse">
        <div className="h-10 bg-white/5 rounded-xl w-64" />
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <GlassCard className="!p-8 text-center max-w-6xl">
        <p className="text-slate-400">Could not load full mock analytics.</p>
        <button type="button" onClick={() => void load()} className="mt-3 text-blue-400 text-sm hover:underline">
          Retry
        </button>
      </GlassCard>
    );
  }

  return (
    <FullMockAnalyticsView
      analytics={analytics}
      mocks={mocks}
      showForm={showForm}
      onToggleForm={() => setShowForm(!showForm)}
      onDelete={deleteMock}
      formSlot={
        <MockTestForm onSubmit={submit} onCancel={() => setShowForm(false)} saving={saving} />
      }
    />
  );
}
