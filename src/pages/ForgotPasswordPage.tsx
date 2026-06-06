import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthPageFrame from './AuthPageFrame';
import { requestPasswordReset } from '../services/auth';

const genericSuccessMessage = 'If an account exists for this email, a reset link has been sent.';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await requestPasswordReset({ email });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request a password reset right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageFrame
      eyebrow="Password Recovery"
      intro="Request a secure reset link and we will email next steps if the account is on file."
      title="Reset your password without contacting support."
    >
      {isSuccess ? (
        <div className="space-y-5">
          <p className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-4 text-sm text-[var(--text)]">
            {genericSuccessMessage}
          </p>
          <Link
            className="inline-flex rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)]"
            to="/login"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
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
              {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>
          <p className="mt-5 text-sm text-[var(--text-muted)]">
            Remembered your password?{' '}
            <Link className="font-medium text-[var(--text)] underline underline-offset-4" to="/login">
              Return to sign in
            </Link>
            .
          </p>
        </>
      )}
    </AuthPageFrame>
  );
}
