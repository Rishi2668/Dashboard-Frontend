import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, SkipForward, X, RotateCcw, Square } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { PRACTICE_TYPE_LABELS, MODE_INFO, type CalcMode, type CalcSession } from '@/types/calcPractice';
import { cn } from '@/lib/utils';

interface PracticeArenaProps {
  session: CalcSession;
  questionText: string;
  practiceType: string;
  questionNumber: number;
  correctStreak: number;
  timeLeftSec: number | null;
  questionElapsedMs: number;
  feedback: 'idle' | 'correct' | 'wrong' | 'skipped';
  explanation: string;
  displayAnswer: string;
  loading: boolean;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  onNext: () => void;
  onEnd: () => void;
}

export function PracticeArena({
  session,
  questionText,
  practiceType,
  questionNumber,
  correctStreak,
  timeLeftSec,
  questionElapsedMs,
  feedback,
  explanation,
  displayAnswer,
  loading,
  onSubmit,
  onSkip,
  onNext,
  onEnd,
}: PracticeArenaProps) {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswer('');
    inputRef.current?.focus();
  }, [questionText]);

  const acc =
    session.total_questions > 0
      ? Math.round((session.correct_count / session.total_questions) * 100)
      : 0;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && feedback === 'idle' && answer.trim()) onSubmit(answer.trim());
    if (e.key === 'Enter' && feedback !== 'idle') onNext();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {MODE_INFO[session.mode as CalcMode]?.label ?? session.mode}
          </span>
          <span className="text-xs text-slate-500 capitalize">{session.difficulty}</span>
          {correctStreak >= 3 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300"
            >
              🔥 {correctStreak} streak
            </motion.span>
          )}
        </motion.div>
        <div className="flex items-center gap-4">
          {timeLeftSec != null && (
            <div
              className={cn(
                'text-lg font-mono font-bold tabular-nums',
                timeLeftSec <= 30 ? 'text-red-400' : 'text-white'
              )}
            >
              {Math.floor(timeLeftSec / 60)}:{String(timeLeftSec % 60).padStart(2, '0')}
            </div>
          )}
          <ProgressRing progress={acc} size={52} label={`${acc}%`} />
          <button
            type="button"
            onClick={onEnd}
            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
            title="End session"
          >
            <Square size={18} />
          </button>
        </div>
      </div>

      <GlassCard className="!p-8 min-h-[280px] flex flex-col justify-center relative overflow-hidden">
        <motion.div
          className="absolute top-4 right-4 text-xs text-slate-500"
          key={questionNumber}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Q{questionNumber} · {(questionElapsedMs / 1000).toFixed(1)}s
        </motion.div>
        <p className="text-xs text-purple-400 mb-2 uppercase tracking-wider">
          {PRACTICE_TYPE_LABELS[practiceType] ?? practiceType}
        </p>
        <AnimatePresence mode="wait">
          <motion.h2
            key={questionText}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-3xl sm:text-4xl font-bold text-white text-center mb-8"
          >
            {questionText}
          </motion.h2>
        </AnimatePresence>

        {feedback === 'idle' ? (
          <div className="max-w-xs mx-auto w-full">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your answer"
              disabled={loading}
              className="w-full text-center text-2xl font-bold py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-white focus:border-blue-500 focus:outline-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                disabled={loading || !answer.trim()}
                onClick={() => onSubmit(answer.trim())}
                className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Check size={18} />
                Submit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onSkip}
                className="py-3 px-4 rounded-xl bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 flex items-center gap-1.5"
                title="Skip question"
              >
                <SkipForward size={18} />
                <span className="text-sm hidden sm:inline">Skip</span>
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'text-center p-6 rounded-2xl border',
              feedback === 'correct'
                ? 'bg-green-500/10 border-green-500/30'
                : feedback === 'wrong'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-white/5 border-white/10'
            )}
          >
            {feedback === 'correct' && (
              <Check className="mx-auto text-green-400 mb-2" size={40} />
            )}
            {feedback === 'wrong' && <X className="mx-auto text-red-400 mb-2" size={40} />}
            <p className="text-lg font-semibold text-white">
              {feedback === 'correct'
                ? 'Correct!'
                : feedback === 'skipped'
                  ? 'Skipped'
                  : `Answer: ${displayAnswer}`}
            </p>
            {feedback === 'skipped' && displayAnswer && (
              <p className="text-sm text-slate-300 mt-1">Correct answer: {displayAnswer}</p>
            )}
            {explanation && <p className="text-sm text-slate-400 mt-2">{explanation}</p>}
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="mt-4 px-6 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Next Question
            </button>
          </motion.div>
        )}
      </GlassCard>

      <div className="flex justify-center gap-6 text-sm text-slate-500">
        <span>
          {session.correct_count}/{session.total_questions} correct
        </span>
        <span>+{session.xp_earned} XP</span>
      </div>
    </div>
  );
}
