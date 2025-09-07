import type { Metadata } from 'next';
import Integration from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('integration');

  return {
    title: t('title'),
  };
}

export default Integration;
