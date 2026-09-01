'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations('locale');
  const { replace } = useRouter();

  const otherLocale = locale === 'es' ? 'en' : 'es';

  const handleClick = () => {
    const path = window.location.pathname + window.location.search;
    replace(path, { locale: otherLocale });
  };

  return (
    <button
      onClick={handleClick}
      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      title={t('switch')}
      aria-label={t('switch')}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}
