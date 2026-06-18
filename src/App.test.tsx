import { render, screen, within } from '@testing-library/react';
import App from './App';
import { siteConfig } from './data/siteData';

const forgotPasswordSuccessMessage =
  'If an account exists for this email, a reset link has been sent.';

describe('App dossier layout', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });
  });

  it('renders the dossier-first sections in English by default', () => {
    render(<App />);
    const masterClassArchive = screen.getByRole('region', {
      name: /Master Class and Choreographer/i,
    });

    expect(
      screen.getByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Training Archive/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Artistic Range/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Featured Performance Reels/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Master Class and Choreographer/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Groups Choreography/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Selected Master Class Moments/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/A focused archive of master classes/i)).toBeInTheDocument();
    expect(
      within(masterClassArchive).getByRole('heading', { name: /Archive Timeline/i })
    ).toBeInTheDocument();
    expect(within(masterClassArchive).getAllByText(/ABT School/i).length).toBeGreaterThan(0);
    expect(within(masterClassArchive).getAllByText(/Yearning Heart/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /Professional Inquiries/i })).toBeInTheDocument();
  });

  it('switches to Chinese dossier labels', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /switch language/i }));
    const masterClassArchive = screen.getByRole('region', {
      name: '大師課與編舞指導',
    });

    expect(screen.getByRole('heading', { name: '藝術家簡介' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '訓練檔案' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '藝術範圍' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選演出影片' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '大師課與編舞指導' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '群體編舞作品' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '精選大師課片段' })).toBeInTheDocument();
    expect(within(masterClassArchive).getByRole('heading', { name: '完整檔案時間線' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });

  it('renders archive entry point labels from shared site data', () => {
    render(<App />);

    for (const entryPoint of siteConfig.archiveEntryPoints) {
      expect(screen.getAllByText(entryPoint.title, { exact: true }).length).toBeGreaterThan(0);
    }
  });

  it('renders a formal archive navigation and professional footer copy', () => {
    render(<App />);

    expect(screen.getAllByRole('link', { name: /Profile/i })[0]).toHaveAttribute('href', '#profile');
    expect(screen.getAllByRole('link', { name: /Archive/i })[0]).toHaveAttribute('href', '#archive');
    expect(screen.getByText(/curated artist archive/i)).toBeInTheDocument();
  });

  it('keeps the archive entry points and professional inquiries visible in Chinese', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }));
    render(<App />);

    await user.click(screen.getByRole('button', { name: /switch language/i }));

    expect(screen.getAllByText('舞作範圍', { exact: true }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: '專業洽詢' })).toBeInTheDocument();
  });

  it('redirects logged-out visitors from protected routes to login', async () => {
    window.history.replaceState({}, '', '/upload');
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Sign in to manage uploads and video access/i })
    ).toBeInTheDocument();
  });

  it('redirects non-admin users away from the admin console', async () => {
    window.history.replaceState({}, '', '/admin');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ user: { id: 7, email: 'viewer@example.com', role: 'user' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /Crystal Huang/i, level: 1 })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /User and video oversight/i })).not.toBeInTheDocument();
  });

  it('shows direct authenticated navigation links when the user is an admin', async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ user: { id: 1, email: 'admin@example.com', role: 'admin' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('admin')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'My Videos' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Upload' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Admin' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('removes the five-minute upload messaging for admins', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/upload');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ user: { id: 1, email: 'admin@example.com', role: 'admin' } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByRole('heading', { name: /Upload a new video/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Upload File/i }));
    expect(screen.queryByText(/^5 minutes$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/No maximum length for admin uploads/i)).toBeInTheDocument();
  });

  it('navigates from login to forgot password', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/login');
    render(<App />);

    await user.click(screen.getByRole('link', { name: /request a reset link/i }));

    expect(
      await screen.findByRole('heading', {
        name: /Reset your password without contacting support/i,
      })
    ).toBeInTheDocument();
  });

  it('renders an invite code field on the registration page with mobile-friendly numeric hints', async () => {
    window.history.replaceState({}, '', '/register');
    render(<App />);

    const inviteCodeInput = await screen.findByLabelText(/invite code/i);

    expect(inviteCodeInput).toBeInTheDocument();
    expect(inviteCodeInput).toHaveAttribute('inputmode', 'numeric');
    expect(inviteCodeInput).toHaveAttribute('pattern', '[0-9]{6}');
    expect(inviteCodeInput).toHaveAttribute('autocomplete', 'one-time-code');
    expect(inviteCodeInput).toHaveAttribute('maxlength', '6');
  });

  it('submits inviteCode in the register request payload', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/register');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/register')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(
          JSON.stringify({
            email: 'dancer@example.com',
            password: 'new-password-1',
            inviteCode: '123456',
          })
        );

        return new Response(
          JSON.stringify({ user: { id: 9, email: 'dancer@example.com', role: 'user' } }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (url.endsWith('/api/videos')) {
        return new Response(JSON.stringify({ videos: [] }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/confirm password/i), 'new-password-1');
    await user.type(screen.getByLabelText(/invite code/i), '123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('heading', { name: /^my videos$/i })).toBeInTheDocument();
  });

  it('shows the backend invite-code error when registration is rejected', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/register');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/register')) {
        expect(init?.body).toBe(
          JSON.stringify({
            email: 'dancer@example.com',
            password: 'new-password-1',
            inviteCode: '123456',
          })
        );

        return new Response(JSON.stringify({ message: 'Invite code is invalid or expired' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/confirm password/i), 'new-password-1');
    await user.type(screen.getByLabelText(/invite code/i), '123456');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/Invite code is invalid or expired/i)).toBeInTheDocument();
  });

  it('submits forgot password requests with generic success messaging', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/forgot-password');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/forgot-password')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(JSON.stringify({ email: 'dancer@example.com' }));

        return new Response(JSON.stringify({ message: 'Backend message should stay hidden' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'dancer@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(forgotPasswordSuccessMessage)).toBeInTheDocument();
    expect(screen.queryByText(/Backend message should stay hidden/i)).not.toBeInTheDocument();
  });

  it('validates matching passwords before calling reset password', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=token-123');
    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-2');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/Passwords must match/i)).toBeInTheDocument();
    expect(
      vi.mocked(fetch).mock.calls.some(([input]) =>
        (typeof input === 'string' ? input : input.toString()).endsWith('/api/auth/reset-password')
      )
    ).toBe(false);
  });

  it('submits a valid reset password token and shows the login handoff', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=token-123');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/reset-password')) {
        expect(init?.method).toBe('POST');
        expect(init?.body).toBe(JSON.stringify({ password: 'new-password-1', token: 'token-123' }));

        return new Response(JSON.stringify({ message: 'Password updated' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/Your password has been updated. You can now sign in with your new password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/login');
  });

  it('shows a clear recovery path when the reset token is invalid or expired', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({
      user: userEvent.setup(),
    }));
    window.history.replaceState({}, '', '/reset-password?token=expired-token');
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (url.endsWith('/api/auth/reset-password')) {
        return new Response(
          JSON.stringify({ message: 'This reset link is invalid or expired. Request a new password reset link and try again.' }),
          {
            status: 410,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    await user.type(screen.getByLabelText(/^new password$/i), 'new-password-1');
    await user.type(screen.getByLabelText(/^confirm new password$/i), 'new-password-1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/This reset link is invalid or expired. Request a new password reset link and try again/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /request a new link/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });
});
