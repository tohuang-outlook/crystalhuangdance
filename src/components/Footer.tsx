import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="section-divider px-4 py-8 sm:px-6 lg:px-8">
      <div className="container-max flex flex-col gap-3 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Crystal Huang.</p>
        <p>
          {t(
            'Curated artist archive for professional review and inquiry.',
            '為專業審閱與洽詢所策劃的藝術家檔案。'
          )}
        </p>
      </div>
    </footer>
  );
}
