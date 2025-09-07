import type { Metadata } from 'next';
import SignIn from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sign-in');

  return {
    title: t('title'),
  };
}

export default SignIn;
