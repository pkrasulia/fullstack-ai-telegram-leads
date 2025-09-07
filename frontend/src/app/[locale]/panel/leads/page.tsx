import type { Metadata } from 'next';
import Assistant from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('assistant');

  return {
    title: t('title'),
  };
}

export default Assistant;
