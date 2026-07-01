import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCheckboxProps {
  label: string;
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
  sublabel?: string;
}

export function TopicCheckbox({ label, completed, onToggle, disabled, sublabel }: TopicCheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'roadmap-topic-item',
        completed && 'roadmap-topic-item--done',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <span className={cn('roadmap-check', completed && 'roadmap-check--on')}>
        {completed && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('roadmap-topic-label', completed && 'roadmap-topic-label--done')}>
          {label}
        </span>
        {sublabel && <span className="mt-0.5 block text-xs text-slate-400">{sublabel}</span>}
      </span>
    </button>
  );
}
