import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemedToaster } from '@/components/ui/ThemedToaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
);
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const SectionalAnalyticsPage = lazy(() =>
  import('@/pages/SectionalAnalyticsPage').then((m) => ({ default: m.SectionalAnalyticsPage }))
);
const RevisionPage = lazy(() => import('@/pages/RevisionPage').then((m) => ({ default: m.RevisionPage })));
const WeakAreasPage = lazy(() => import('@/pages/WeakAreasPage').then((m) => ({ default: m.WeakAreasPage })));
const NotesPage = lazy(() => import('@/pages/NotesPage').then((m) => ({ default: m.NotesPage })));
const TargetsPage = lazy(() => import('@/pages/TargetsPage').then((m) => ({ default: m.TargetsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SyllabusRoadmapPage = lazy(() =>
  import('@/pages/SyllabusRoadmapPage').then((m) => ({ default: m.SyllabusRoadmapPage }))
);
const OverallAnalysisPage = lazy(() =>
  import('@/pages/OverallAnalysisPage').then((m) => ({ default: m.OverallAnalysisPage }))
);
const CalcTrainerPage = lazy(() =>
  import('@/pages/CalcTrainerPage').then((m) => ({ default: m.CalcTrainerPage }))
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="page-spinner" aria-label="Loading page" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemedToaster />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="roadmap" element={<SyllabusRoadmapPage />} />
              <Route path="overall-analysis" element={<OverallAnalysisPage />} />
              <Route path="calc-trainer" element={<CalcTrainerPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="sectional-analytics" element={<SectionalAnalyticsPage />} />
              <Route path="revision" element={<RevisionPage />} />
              <Route path="weak-areas" element={<WeakAreasPage />} />
              <Route path="notes" element={<NotesPage />} />
              <Route path="targets" element={<TargetsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
