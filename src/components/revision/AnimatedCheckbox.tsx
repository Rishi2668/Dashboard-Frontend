import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function AnimatedCheckbox({ checked, onToggle, disabled }: AnimatedCheckboxProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      disabled={disabled}
      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'bg-green-500/30 border-green-400 text-green-300'
          : 'bg-white/5 border-white/20 text-transparent hover:border-green-400/50'
      } disabled:opacity-50`}
      aria-label={checked ? 'Completed' : 'Mark complete'}
    >
      <motion.span
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        <Check size={18} />
      </motion.span>
    </motion.button>
  );
}
