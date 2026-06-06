import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthPageFrame from './AuthPageFrame';
import { resetPassword } from '../services/auth';

export default function ResetPasswordPage() {
  const token = useMemo(
    () => new URLSearchParams(window.location.search).get('token')?.trim() ?? '',
    []
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('This reset link is invalid or incomplete. Request a new password reset link to continue.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword({ password, token });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'This reset link is invalid or expired. Request a new password reset link and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageFrame
      eyebrow="Set A New Password"
      intro="Choose a new password for your account. Reset links are time-limited for security."
      title="Finish resetting your account password."
    >
      {isSuccess ? (
        <div className="space-y-5">
          <p className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 text-sm text-[var(--text)]">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Link
            className="inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)]"
            to="/login"
          >
            Go to sign in
          </Link>
        </div>
      ) : (
        <>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                New password
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
                Confirm new password
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
            {error && (
              <p className="rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
                {error}
              </p>
            )}
            <button
              className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>
          <p className="mt-5 text-sm text-[var(--text-muted)]">
            Need a fresh reset email?{' '}
            <Link
              className="font-medium text-[var(--text)] underline underline-offset-4"
              to="/forgot-password"
            >
              Request a new link
            </Link>
            .
          </p>
        </>
      )}
    </AuthPageFrame>
  );
}
