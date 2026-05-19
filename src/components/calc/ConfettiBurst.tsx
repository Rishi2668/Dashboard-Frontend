import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899'];

export function ConfettiBurst({ show }: { show: boolean }) {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.3,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    }))
  );

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {}, 2000);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0 }}
              animate={{ opacity: 0, y: '110vh', rotate: p.rotate + 720 }}
              transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
              className="absolute w-2 h-3 rounded-sm"
              style={{ backgroundColor: p.color, left: 0 }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
