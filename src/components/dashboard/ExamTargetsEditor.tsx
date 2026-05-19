import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { syllabusApi, authApi, dashboardApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import type { DashboardStats } from '@/types';

interface ExamTargetsEditorProps {
  stats: DashboardStats;
  onUpdated?: (stats: DashboardStats) => void;
}

export function ExamTargetsEditor({ stats, onUpdated }: ExamTargetsEditorProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const [targetMarks, setTargetMarks] = useState(stats.user.target_marks?.toString() ?? '');
  const [examDate, setExamDate] = useState(stats.user.exam_date ?? '');
  const [targetRank, setTargetRank] = useState(stats.user.target_rank?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTargetMarks(stats.user.target_marks?.toString() ?? '');
    setExamDate(stats.user.exam_date ?? '');
    setTargetRank(stats.user.target_rank?.toString() ?? '');
  }, [stats.user.target_marks, stats.user.exam_date, stats.user.target_rank]);

  const save = async () => {
    setSaving(true);
    try {
      const rank = targetRank.trim() ? parseInt(targetRank, 10) : undefined;
      await syllabusApi.updateExamTargets({
        target_rank: rank,
        target_marks: targetMarks ? parseFloat(targetMarks) : undefined,
        exam_date: examDate || undefined,
      });
      const { data: user } = await authApi.updateMe({
        target_rank: rank,
        target_marks: targetMarks ? parseFloat(targetMarks) : undefined,
        exam_date: examDate || undefined,
      });
      setUser(user);
      const { data: newStats } = await dashboardApi.stats();
      onUpdated?.(newStats);
      toast.success('Exam targets updated — countdown refreshed');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
      <p className="text-xs text-slate-400 uppercase tracking-wider">Your exam targets (enter manually & save)</p>
      {(stats.user.target_rank != null || stats.user.target_marks != null || stats.user.exam_date) && (
        <p className="text-xs text-slate-500">
          Saved: Rank {stats.user.target_rank != null ? `#${stats.user.target_rank}` : '—'} · Marks{' '}
          {stats.user.target_marks ?? '—'} · Exam {stats.user.exam_date ?? '—'}
        </p>
      )}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] text-slate-500">Target Rank</label>
          <input
            value={targetRank}
            onChange={(e) => setTargetRank(e.target.value)}
            placeholder="100"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500">Target Marks</label>
          <input
            type="number"
            min={0}
            max={600}
            value={targetMarks}
            onChange={(e) => setTargetMarks(e.target.value)}
            placeholder="e.g. 160"
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {examDate && stats.days_left != null && (
          <p className="text-sm text-orange-400 font-medium">{stats.days_left} days until exam</p>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30"
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save targets'}
        </button>
      </div>
    </div>
  );
}
