import createMiddleware from 'next-intl/middleware';
import { localePrefix, locales } from './i18n';

export default createMiddleware({
  defaultLocale: 'en',
  localePrefix,
  locales,
});
export const config = {
  matcher: ['/', '/(ru|en)/:path*'],
};
