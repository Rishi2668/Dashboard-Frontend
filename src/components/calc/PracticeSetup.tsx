import { motion } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  CALC_CATEGORY_TYPES,
  MODE_INFO,
  PRACTICE_TYPE_LABELS,
  type CalcDifficulty,
  type CalcMode,
} from '@/types/calcPractice';
import { cn } from '@/lib/utils';

interface PracticeSetupProps {
  selectedTypes: string[];
  difficulty: CalcDifficulty;
  mode: CalcMode;
  onToggleType: (type: string) => void;
  onDifficulty: (d: CalcDifficulty) => void;
  onMode: (m: CalcMode) => void;
  onStart: () => void;
  loading: boolean;
}

const ALL_TYPES = [...CALC_CATEGORY_TYPES];

export function PracticeSetup({
  selectedTypes,
  difficulty,
  mode,
  onToggleType,
  onDifficulty,
  onMode,
  onStart,
  loading,
}: PracticeSetupProps) {
  const selectMixed = () => {
    if (selectedTypes.length === ALL_TYPES.length) {
      ALL_TYPES.forEach((t) => onToggleType(t));
    } else {
      ALL_TYPES.forEach((t) => {
        if (!selectedTypes.includes(t)) onToggleType(t);
      });
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="!p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Zap className="text-amber-400" size={16} />
          Practice Mode
        </h3>
        <motion.div className="grid sm:grid-cols-2 gap-3" layout>
          {(Object.keys(MODE_INFO) as CalcMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onMode(m)}
              className={cn(
                'p-4 rounded-xl text-left border transition-all',
                mode === m
                  ? 'bg-blue-500/20 border-blue-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
              )}
            >
              <span className="text-2xl">{MODE_INFO[m].icon}</span>
              <p className="font-semibold mt-2">{MODE_INFO[m].label}</p>
              <p className="text-xs mt-1 opacity-80">{MODE_INFO[m].desc}</p>
            </button>
          ))}
        </motion.div>
      </GlassCard>

      <GlassCard className="!p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">Categories</h3>
          <button type="button" onClick={selectMixed} className="text-xs text-blue-400 hover:underline">
            {selectedTypes.length === ALL_TYPES.length ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToggleType(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                selectedTypes.includes(t)
                  ? 'bg-purple-500/25 border-purple-500/50 text-purple-200'
                  : 'bg-white/5 border-white/10 text-slate-500'
              )}
            >
              {PRACTICE_TYPE_LABELS[t]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onToggleType('mixed')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border',
              selectedTypes.includes('mixed') || selectedTypes.length === 0
                ? 'bg-blue-500/25 border-blue-500/50 text-blue-200'
                : 'bg-white/5 border-white/10 text-slate-500'
            )}
          >
            Mixed
          </button>
        </div>
      </GlassCard>

      <GlassCard className="!p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Difficulty</h3>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as CalcDifficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDifficulty(d)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium capitalize border',
                difficulty === d
                  ? d === 'easy'
                    ? 'bg-green-500/20 border-green-500/40 text-green-300'
                    : d === 'hard'
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-500'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </GlassCard>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        disabled={loading || (selectedTypes.length === 0 && !selectedTypes.includes('mixed'))}
        onClick={onStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Play size={20} />
        {loading ? 'Starting...' : 'Start Practice'}
      </motion.button>
    </div>
  );
}
