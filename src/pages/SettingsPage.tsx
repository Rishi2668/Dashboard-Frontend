import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Palette } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { minimalMode, setMinimalMode } = useUIStore();
  const [name, setName] = useState(user?.name ?? '');
  const [targetYear, setTargetYear] = useState(user?.target_year ?? 2026);
  const [targetRank, setTargetRank] = useState(user?.target_rank?.toString() ?? '');
  const [targetMarks, setTargetMarks] = useState(user?.target_marks?.toString() ?? '');
  const [examDate, setExamDate] = useState(user?.exam_date ?? '');

  const save = async () => {
    try {
      const { data } = await authApi.updateMe({
        name,
        target_year: targetYear,
        target_rank: targetRank ? parseInt(targetRank) : undefined,
        target_marks: targetMarks ? parseFloat(targetMarks) : undefined,
        exam_date: examDate || undefined,
      } as Parameters<typeof authApi.updateMe>[0]);
      setUser(data);
      toast.success('Profile updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <motion.div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Settings className="text-slate-400" />
        Settings
      </h1>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-blue-400" />
          <h3 className="font-semibold">Profile</h3>
        </div>
        <motion.div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            placeholder="Name"
          />
          <input
            type="number"
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            placeholder="Target Year"
          />
          <input
            value={targetRank}
            onChange={(e) => setTargetRank(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            placeholder="Target Rank"
          />
          <input
            type="number"
            value={targetMarks}
            onChange={(e) => setTargetMarks(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            placeholder="Target Marks (e.g. 160)"
          />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
          />
          <p className="text-xs text-slate-500">{user?.email}</p>
          <button onClick={save} className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
            Save Profile
          </button>
        </motion.div>
      </GlassCard>

      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-purple-400" />
          <h3 className="font-semibold">Appearance</h3>
        </div>
        <label className="flex items-center justify-between text-sm text-slate-300">
          Minimal UI mode
          <input
            type="checkbox"
            checked={minimalMode}
            onChange={(e) => setMinimalMode(e.target.checked)}
            className="accent-blue-500"
          />
        </label>
        <p className="text-xs text-slate-500 mt-2">Dark mode is always enabled for focus.</p>
      </GlassCard>

      <GlassCard>
        <motion.div className="flex items-center gap-2 mb-2">
          <Bell size={18} className="text-orange-400" />
          <h3 className="font-semibold">Notifications</h3>
        </motion.div>
        <p className="text-sm text-slate-400">PWA push notifications — enable after installing the app.</p>
      </GlassCard>
    </motion.div>
  );
}
