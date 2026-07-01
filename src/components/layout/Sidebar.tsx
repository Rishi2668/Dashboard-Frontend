import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  Layers,
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/lib/routePrefetch';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/overall-analysis', icon: Brain, label: 'Overall Analysis' },
  { to: '/calc-trainer', icon: Calculator, label: 'Calc Trainer' },
  { to: '/analytics', icon: BarChart3, label: 'Full Mock Analytics' },
  { to: '/sectional-analytics', icon: Layers, label: 'Sectional Analytics' },
  { to: '/revision', icon: RotateCcw, label: 'Revision' },
  { to: '/weak-areas', icon: AlertTriangle, label: 'Weak Areas' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/targets', icon: Target, label: 'Targets' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed, focusMode } =
    useUIStore();

  if (focusMode) return null;

  const collapsed = sidebarCollapsed;

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl text-slate-300 hover:text-white"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : undefined,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen glass border-r border-white/5',
          'flex flex-col py-6 px-3 transition-[width] duration-300 ease-out',
          collapsed ? 'w-[72px]' : 'w-[260px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Desktop collapse / expand */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'hidden lg:flex absolute -right-3 top-7 z-50',
            'h-6 w-6 items-center justify-center rounded-full',
            'bg-[#1a1a24] border border-white/15 text-slate-300',
            'hover:text-white hover:border-blue-500/40 shadow-lg transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div
          className={cn(
            'flex items-center gap-3 mb-8 min-h-[40px]',
            collapsed ? 'justify-center px-0' : 'px-2'
          )}
        >
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Flame className="text-white" size={22} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="font-bold text-white text-lg leading-tight whitespace-nowrap">
                  SSC CGL
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  Prep Dashboard
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={collapsed ? label : undefined}
              onMouseEnter={() => prefetchRoute(to)}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all',
                  collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                )
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Mobile: collapse control at bottom (optional extra) */}
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          className={cn(
            'lg:hidden mt-2 flex items-center justify-center gap-2 py-2 rounded-xl',
            'text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-white/10'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {sidebarOpen && <span>{collapsed ? 'Expand' : 'Collapse'}</span>}
        </button>
      </motion.aside>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={toggleSidebar}
          aria-hidden
        />
      )}
    </>
  );
}
