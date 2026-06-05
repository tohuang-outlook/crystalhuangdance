import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageFrame from './AuthPageFrame';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { error, isLoading, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setFormError('Passwords must match');
      return;
    }

    setFormError(null);

    try {
      await register({ email, password });
      navigate('/my-videos', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create account');
    }
  };

  return (
    <AuthPageFrame
      eyebrow="Creator Access"
      intro="Registration is intentionally lightweight here so we can finalize server-side requirements later without blocking the frontend shell."
      title="Create an account for private video tools."
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
            autoComplete="new-password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Confirm password
          </span>
          <input
            autoComplete="new-password"
            className="w-full rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--accent-strong)]"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-sm text-[var(--text-muted)]">
        Already registered?{' '}
        <Link className="font-medium text-[var(--text)] underline underline-offset-4" to="/login">
          Sign in here
        </Link>
        .
      </p>
    </AuthPageFrame>
  );
}
