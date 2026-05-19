import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  Calculator,
  RotateCcw,
  AlertTriangle,
  StickyNote,
  Target,
  Map,
  Settings,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Syllabus Roadmap' },
  { to: '/overall-analysis', icon: Brain, label: 'Overall Analysis' },
  { to: '/calc-trainer', icon: Calculator, label: 'Calc Trainer' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/revision', icon: RotateCcw, label: 'Revision' },
  { to: '/weak-areas', icon: AlertTriangle, label: 'Weak Areas' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/targets', icon: Target, label: 'Targets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, focusMode } = useUIStore();

  if (focusMode) return null;

  return (
  <>
    <button
      onClick={toggleSidebar}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl"
      aria-label="Toggle menu"
    >
      {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
    </button>

    <motion.aside
      initial={false}
      animate={{ x: sidebarOpen ? 0 : -280 }}
      className={cn(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] glass border-r border-white/5',
        'flex flex-col py-6 px-4',
        !sidebarOpen && 'lg:translate-x-0 -translate-x-full lg:w-[72px]'
      )}
    >
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Flame className="text-white" size={22} />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-bold text-white text-lg leading-tight">SSC CGL</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Prep Dashboard</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onMouseEnter={
              to === '/calc-trainer'
                ? () => void import('@/pages/CalcTrainerPage')
                : undefined
            }
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>

    {sidebarOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="lg:hidden fixed inset-0 bg-black/60 z-30"
        onClick={toggleSidebar}
      />
    )}
  </>
  );
}
