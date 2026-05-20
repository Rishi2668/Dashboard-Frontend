import { Component, type ReactNode } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('UI error boundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0f] p-6">
          <GlassCard className="max-w-xl mx-auto !p-8 text-center">
            <h2 className="text-white text-lg font-semibold">Something went wrong</h2>
            <p className="text-slate-400 text-sm mt-2">
              Please refresh the page. Your data is safe.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              Refresh
            </button>
          </GlassCard>
        </div>
      );
    }
    return this.props.children;
  }
}

