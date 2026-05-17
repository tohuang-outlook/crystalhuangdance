import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { label: t('Profile', '簡介'), href: '#profile' },
    { label: t('Archive', '檔案'), href: '#archive' },
    { label: t('Distinctions', '榮譽'), href: '#distinctions' },
    { label: t('Media', '影像'), href: '#videos' },
    { label: t('Contact', '聯絡'), href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <a
            href="#home"
            className="font-serif text-lg tracking-[0.18em] text-[var(--text)] sm:text-xl"
          >
            Crystal Huang
          </a>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <a
                key={`${link.href}-${link.label}`}
                href={link.href}
                className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {link.label}
              </a>
            ))}

            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              aria-label="Toggle language"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
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
          {navLinks.map((link) => (
            <a
              key={`${link.href}-${link.label}`}
              href={link.href}
              className="block rounded-lg px-3 py-3 text-sm text-[var(--text-muted)] transition-colors hover:bg-[rgba(243,238,228,0.04)] hover:text-[var(--text)]"
              onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
