import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { label: t('Home', '首頁'), href: '#home' },
    { label: t('About', '關於我'), href: '#about' },
    { label: t('Dance Styles', '舞蹈風格'), href: '#styles' },
    { label: t('Achievements', '成就'), href: '#achievements' },
    { label: t('Videos', '影片'), href: '#videos' },
    { label: t('Gallery', '相簿'), href: '#gallery' },
    { label: t('Contact', '聯絡'), href: '#contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0f]/90 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#home" className="text-xl sm:text-2xl font-bold tracking-wide">
            <span className="gradient-text">Crystal Huang</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="ml-2 px-3 py-1.5 rounded-full border border-white/20 text-sm font-medium text-gray-300 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center gap-1.5"
              aria-label="Toggle language"
            >
              <span className="text-base">{lang === 'en' ? '🇹🇼' : '🇺🇸'}</span>
              <span>{lang === 'en' ? '中文' : 'EN'}</span>
            </button>

            <a
              href="#contact"
              className="ml-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              {t('Get in Touch', '聯絡我')}
            </a>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-3">
            {/* Language toggle mobile */}
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="px-2.5 py-1 rounded-full border border-white/20 text-xs font-medium text-gray-300"
            >
              {lang === 'en' ? '中文' : 'EN'}
            </button>
            <button
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-4 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="block px-4 py-3 text-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold mt-4"
            onClick={() => setIsOpen(false)}
          >
            {t('Get in Touch', '聯絡我')}
          </a>
        </div>
      </div>
    </nav>
  );
}
