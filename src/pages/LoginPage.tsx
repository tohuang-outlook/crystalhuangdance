import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageFrame from './AuthPageFrame';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isAuthenticated, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const from = typeof location.state?.from === 'string' ? location.state.from : '/my-videos';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [from, isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to sign in');
    }
  };

  return (
    <AuthPageFrame
      eyebrow="Artist Portal"
      intro="This first-pass login flow is wired to the client-side auth shell so protected pages can be safely gated before backend upload work begins."
      title="Sign in to manage uploads and video access."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Email
          </span>
          <input
            autoComplete="email"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Password
          </span>
          <input
            autoComplete="current-password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {(formError || error) && (
          <p className="rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
            {formError || error}
          </p>
        )}
        <button
          className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-sm text-[var(--text-muted)]">
        Forgot your password?{' '}
        <Link
          className="font-medium text-[var(--text)] underline underline-offset-4"
          to="/forgot-password"
        >
          Request a reset link
        </Link>
        .
      </p>
      <p className="mt-5 text-sm text-[var(--text-muted)]">
        Need an account?{' '}
        <Link className="font-medium text-[var(--text)] underline underline-offset-4" to="/register">
          Register here
        </Link>
        .
      </p>
    </AuthPageFrame>
  );
}
