import { useOutletContext } from 'react-router-dom';
import { SectionalTestForm } from '@/components/mock/SectionalTestForm';
import { SectionalAnalyticsView } from '@/components/mock/SectionalAnalyticsView';
import { GlassCard } from '@/components/ui/GlassCard';
import { useMockTestAnalytics } from '@/hooks/useMockTestAnalytics';

interface LayoutContext {
  refreshStats?: () => void;
}

export function SectionalAnalyticsPage() {
  const { refreshStats } = useOutletContext<LayoutContext>();
  const { analytics, mocks, showForm, setShowForm, saving, loading, submit, deleteMock, load } =
    useMockTestAnalytics('sectional', refreshStats);

  if (loading && !analytics) {
    return <div className="animate-pulse h-64 bg-white/5 rounded-2xl max-w-6xl" />;
  }

  if (!analytics) {
    return (
      <GlassCard className="!p-8 text-center max-w-6xl">
        <p className="text-slate-400">Could not load sectional analytics.</p>
        <button type="button" onClick={() => void load()} className="mt-3 text-purple-400 text-sm">
          Retry
        </button>
      </GlassCard>
    );
  }

  return (
    <SectionalAnalyticsView
      analytics={analytics}
      mocks={mocks}
      showForm={showForm}
      onToggleForm={() => setShowForm(!showForm)}
      onDelete={deleteMock}
      formSlot={
        <SectionalTestForm onSubmit={submit} onCancel={() => setShowForm(false)} saving={saving} />
      }
    />
  );
}
