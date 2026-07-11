import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardShell } from "./components/DashboardShell";
import { LoginPage } from "./components/LoginPage";
import { useAuth } from "./lib/auth";
import { fetchDashboardStats, supabase, type DashboardStats, type TrendPeriod } from "./lib/supabase";

function ProtectedDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<TrendPeriod>("30d");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadStats = useCallback(async (nextPeriod: TrendPeriod = period) => {
    setSyncing(true);
    try {
      const data = await fetchDashboardStats(nextPeriod);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load analytics");
    } finally {
      setLoading(false);
      window.setTimeout(() => setSyncing(false), 500);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    loadStats(period);
  }, [period, loadStats]);

  useEffect(() => {
    const interval = window.setInterval(() => loadStats(period), 15000);
    return () => window.clearInterval(interval);
  }, [loadStats, period]);

  useEffect(() => {
    const subscription = supabase
      .channel("qr_scan_events_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "qr_scan_events" },
        () => {
          loadStats(period);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadStats, period]);

  if (loading && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading analytics…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-card max-w-md p-6 text-center">
          <p className="text-red-200">{error}</p>
          <button
            onClick={() => loadStats(period)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-background"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <DashboardShell
      stats={stats}
      period={period}
      onPeriodChange={setPeriod}
      onSignOut={signOut}
      syncing={syncing}
    />
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Checking session…
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Checking session…
      </div>
    );
  }
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <ProtectedDashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
