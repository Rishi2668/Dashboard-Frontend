import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';
import { dashboardApi } from '@/api';
import type { DashboardStats } from '@/types';
import { LogOut, Focus, Maximize2, Minimize2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useFullscreen } from '@/hooks/useFullscreen';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function DashboardLayout() {
  const location = useLocation();
  const { focusMode, setFocusMode, pomodoroActive, tickPomodoro } = useUIStore();
  const { active: browserFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await dashboardApi.stats()).data as DashboardStats,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
  const refreshStats = () => queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  const setStats = (next: DashboardStats) => queryClient.setQueryData(['dashboard-stats'], next);

  useEffect(() => {
    if (!pomodoroActive) return;
    const id = setInterval(tickPomodoro, 1000);
    return () => clearInterval(id);
  }, [pomodoroActive, tickPomodoro]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFullscreen = async () => {
    if (!browserFullscreen) setFocusMode(true);
    else setFocusMode(false);
    await toggleFullscreen();
  };

  return (
    <div className="flex min-h-screen bg-app">
      {!focusMode && <Sidebar />}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {focusMode ? '🎯 Deep Focus' : `Hey, ${user?.name?.split(' ')[0] ?? 'Aspirant'}!`}
            </h2>
            <p className="text-xs text-slate-400">
              {stats ? `Level: ${stats.level} · ${stats.xp} XP` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-xl transition ${focusMode ? 'bg-orange-500/20 text-orange-400' : 'glass text-slate-400 hover:text-white'}`}
              title="Focus mode"
            >
              <Focus size={18} />
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              className={`p-2 rounded-xl transition ${
                browserFullscreen
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'glass text-slate-400 hover:text-white'
              }`}
              title={browserFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {browserFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 glass rounded-xl text-slate-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto p-6"
          >
            <Outlet context={{ stats: stats ?? null, setStats, refreshStats }} />
          </motion.div>
          {!focusMode && <RightPanel stats={stats ?? null} />}
        </div>
      </main>
    </div>
  );
}
