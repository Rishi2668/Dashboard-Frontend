import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  focusMode: boolean;
  minimalMode: boolean;
  fullscreenStudy: boolean;
  pomodoroMinutes: number;
  pomodoroActive: boolean;
  pomodoroSecondsLeft: number;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setFocusMode: (v: boolean) => void;
  setMinimalMode: (v: boolean) => void;
  setFullscreenStudy: (v: boolean) => void;
  startPomodoro: (minutes?: number) => void;
  stopPomodoro: () => void;
  tickPomodoro: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      focusMode: false,
      minimalMode: false,
      fullscreenStudy: false,
      pomodoroMinutes: 25,
      pomodoroActive: false,
      pomodoroSecondsLeft: 25 * 60,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setFocusMode: (v) => set({ focusMode: v, minimalMode: v ? true : get().minimalMode }),
      setMinimalMode: (v) => set({ minimalMode: v }),
      setFullscreenStudy: (v) => set({ fullscreenStudy: v }),
      startPomodoro: (minutes = 25) =>
        set({ pomodoroActive: true, pomodoroMinutes: minutes, pomodoroSecondsLeft: minutes * 60 }),
      stopPomodoro: () => set({ pomodoroActive: false }),
      tickPomodoro: () => {
        const left = get().pomodoroSecondsLeft - 1;
        if (left <= 0) {
          set({ pomodoroActive: false, pomodoroSecondsLeft: get().pomodoroMinutes * 60 });
        } else {
          set({ pomodoroSecondsLeft: left });
        }
      },
    }),
    {
      name: 'ui-storage',
      partialize: (s) => ({ minimalMode: s.minimalMode, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
