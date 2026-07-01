import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, fetchUser } = useAuthStore();
  const location = useLocation();
  const hasToken = !!localStorage.getItem('access_token');

  useEffect(() => {
    if (hasToken) {
      void fetchUser();
    }
  }, [fetchUser, hasToken]);

  if (!hasToken && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="page-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
