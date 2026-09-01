import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: {
    mode: 'as-needed',
  },
});

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
