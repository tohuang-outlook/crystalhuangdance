import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireMemberType,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
  requireMemberType?: 'dancer' | 'investor';
}) {
  const { getDefaultMemberRoute, isAdmin, isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="section-padding pt-32 sm:pt-36">
        <div className="container-max">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center shadow-[0_24px_60px_rgba(68,102,136,0.16)]">
            <p className="eyebrow">Checking session</p>
            <h1 className="mt-4 text-4xl text-[var(--text)]">Preparing your portal</h1>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate replace to={getDefaultMemberRoute()} />;
  }

  if (requireMemberType && user?.memberType !== requireMemberType) {
    return <Navigate replace to={getDefaultMemberRoute()} />;
  }

  return <>{children}</>;
}
