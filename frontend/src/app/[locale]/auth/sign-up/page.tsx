import type { Metadata } from 'next';
import SignUp from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sign-up');

  return {
    title: t('title'),
  };
}

export default SignUp;
