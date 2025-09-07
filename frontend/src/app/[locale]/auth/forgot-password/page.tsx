import type { Metadata } from 'next';
import ForgotPassword from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('forgot-password');

  return {
    title: t('title'),
  };
}

export default ForgotPassword;
