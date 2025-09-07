import type { Metadata } from 'next';
import Dashboard from './page-content';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('dashboard');

  return {
    title: t('title'),
  };
}

export default Dashboard;
