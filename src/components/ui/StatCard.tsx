import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  delay?: number;
}

const colors = {
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  orange: 'bg-orange-500/20 text-orange-400',
  purple: 'bg-purple-500/20 text-purple-400',
};

export function StatCard({ label, value, icon: Icon, trend, color = 'blue', delay = 0 }: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard>
        <motion.div
          className={`inline-flex p-2.5 rounded-xl ${colors[color]} mb-3`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon size={20} />
        </motion.div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
      </GlassCard>
    </motion.div>
  );
}
