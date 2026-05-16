import { Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Crystal Huang. {t('All rights reserved.', '版權所有。')}
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            {t('Made with', '以')} <Heart size={14} className="text-red-400 fill-red-400 mx-1" />{' '}
            {t('for the love of dance', '對舞蹈的熱愛製作')}
          </p>
        </div>
      </div>
    </footer>
  );
}
