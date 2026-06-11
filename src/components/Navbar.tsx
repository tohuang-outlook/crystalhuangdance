import { useEffect, useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { isAdmin, isAuthenticated, isLoading, logout, user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navLinks = [
    { label: t('Profile', '簡介'), href: '#profile' },
    { label: t('Archive', '檔案'), href: '#archive' },
    { label: t('Distinctions', '榮譽'), href: '#distinctions' },
    { label: t('Media', '影像'), href: '#styles' },
    { label: t('Master Class', '大師課'), href: '#gallery' },
    { label: t('Contact', '聯絡'), href: '#contact' },
  ];

  const privateLinks = [
    { label: 'My Videos', to: '/my-videos' },
    { label: 'Upload', to: '/upload' },
    ...(isAdmin ? [{ label: 'Admin', to: '/admin' }] : []),
  ];

  const accountLabel = useMemo(() => {
    if (!user?.email) {
      return 'Account';
    }

    return user.email.split('@')[0].slice(0, 16);
  }, [user?.email]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[var(--line)] bg-[rgba(238,246,255,0.84)] backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link
            to="/"
            className="font-serif text-lg tracking-[0.18em] text-[var(--text)] sm:text-xl"
          >
            Crystal Huang
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {isHome &&
              navLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  {link.label}
                </a>
              ))}

            {isLoading ? (
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Session...
              </span>
            ) : isAuthenticated ? (
              <>
                <span className="max-w-40 truncate text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {accountLabel}
                </span>
                <button
                  className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
                <button
                  onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  aria-label="Toggle language"
                >
                  {lang === 'en' ? '中文' : 'EN'}
                </button>
                {privateLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `text-xs uppercase tracking-[0.2em] transition-colors ${
                        isActive
                          ? 'text-[var(--text)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                <button
                  onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  aria-label="Toggle language"
                >
                  {lang === 'en' ? '中文' : 'EN'}
                </button>
                <Link
                  className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  to="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[var(--text-muted)]"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]"
              aria-label="Switch language"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
            <button
              className="text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              onClick={() => setIsOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[var(--line)] bg-[rgba(238,246,255,0.94)] md:hidden">
          <div className="container-max space-y-2 px-4 py-4 sm:px-6">
            {isHome &&
              navLinks.map((link) => (
                <a
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-sm text-[var(--text-muted)] transition-colors hover:bg-[rgba(243,238,228,0.04)] hover:text-[var(--text)]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}

            {isAuthenticated &&
              privateLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/60 text-[var(--text)]'
                        : 'text-[var(--text-muted)] hover:bg-[rgba(243,238,228,0.04)] hover:text-[var(--text)]'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}

            {!isLoading && !isAuthenticated && (
              <>
                <Link
                  className="block rounded-lg px-3 py-3 text-sm text-[var(--text-muted)] transition-colors hover:bg-[rgba(243,238,228,0.04)] hover:text-[var(--text)]"
                  onClick={() => setIsOpen(false)}
                  to="/login"
                >
                  Sign in
                </Link>
                <Link
                  className="block rounded-lg bg-[var(--text)] px-3 py-3 text-sm text-white transition-colors hover:bg-[var(--text-muted)]"
                  onClick={() => setIsOpen(false)}
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}

            {!isLoading && isAuthenticated && (
              <button
                className="block w-full rounded-lg border border-[var(--line)] px-3 py-3 text-left text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                onClick={handleLogout}
              >
                Sign out {user?.email ? `(${user.email})` : ''}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
