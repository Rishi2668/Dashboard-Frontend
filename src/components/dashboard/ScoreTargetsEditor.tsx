import { useEffect, useState } from 'react';
import { Save, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { scoreTargetsApi, dashboardApi } from '@/api';
import type { DashboardStats } from '@/types';
import type { ScoreTarget } from '@/types/targetScore';
import { SUBJECT_TARGET_FIELDS } from '@/types/targetScore';

interface ScoreTargetsEditorProps {
  stats: DashboardStats;
  onUpdated?: (stats: DashboardStats) => void;
}

type FormState = Record<string, string>;

function toForm(t: ScoreTarget): FormState {
  return {
    overall_max_marks: String(t.overall_max_marks),
    overall_target_marks: String(t.overall_target_marks),
    reasoning_max_marks: String(t.reasoning_max_marks),
    reasoning_target_marks: String(t.reasoning_target_marks),
    quant_max_marks: String(t.quant_max_marks),
    quant_target_marks: String(t.quant_target_marks),
    english_max_marks: String(t.english_max_marks),
    english_target_marks: String(t.english_target_marks),
    gk_max_marks: String(t.gk_max_marks),
    gk_target_marks: String(t.gk_target_marks),
  };
}

const DEFAULT_FORM: FormState = {
  overall_max_marks: '200',
  overall_target_marks: '170',
  reasoning_max_marks: '50',
  reasoning_target_marks: '45',
  quant_max_marks: '50',
  quant_target_marks: '48',
  english_max_marks: '50',
  english_target_marks: '47',
  gk_max_marks: '50',
  gk_target_marks: '35',
};

export function ScoreTargetsEditor({ stats, onUpdated }: ScoreTargetsEditorProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (stats.target_analytics?.targets) {
      setForm(toForm(stats.target_analytics.targets));
    } else if (stats.user.target_marks) {
      setForm((f) => ({ ...f, overall_target_marks: String(stats.user.target_marks) }));
    }
  }, [stats.target_analytics, stats.user.target_marks]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, parseFloat(v) || 0])
      ) as unknown as ScoreTarget;
      await scoreTargetsApi.update(payload);
      const { data: newStats } = await dashboardApi.stats();
      onUpdated?.(newStats);
      toast.success('Target scores saved');
    } catch {
      toast.error('Failed to save target scores');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 border border-emerald-500/20 space-y-4">
      <p className="text-xs text-emerald-400/90 uppercase tracking-wider flex items-center gap-2">
        <Target size={14} />
        Target score system (mock goals)
      </p>

      <div className="grid sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <div>
          <label className="text-[10px] text-slate-500">Overall total marks</label>
          <input
            type="number"
            min={0}
            value={form.overall_max_marks}
            onChange={(e) => setForm({ ...form, overall_max_marks: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500">Overall target marks</label>
          <input
            type="number"
            min={0}
            value={form.overall_target_marks}
            onChange={(e) => setForm({ ...form, overall_target_marks: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SUBJECT_TARGET_FIELDS.map(({ key, label, maxKey, targetKey }) => (
          <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <p className="text-xs font-medium text-white">{label}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Total marks</label>
                <input
                  type="number"
                  min={0}
                  value={form[maxKey]}
                  onChange={(e) => setForm({ ...form, [maxKey]: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Target marks</label>
                <input
                  type="number"
                  min={0}
                  value={form[targetKey]}
                  onChange={(e) => setForm({ ...form, [targetKey]: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Target: {form[targetKey] || '—'} / {form[maxKey] || '—'}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/30 ml-auto"
      >
        <Save size={14} />
        {saving ? 'Saving…' : 'Save target scores'}
      </button>
    </div>
  );
}
