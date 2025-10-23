'use client';
import Link from 'next/link';
import { LogoIcon } from './Icons';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('home.footer');

  return (
    <footer id="footer">
      <hr className="w-11/12 mx-auto" />

      <section className="container py-20 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-8 text-center">
        <div className="col-span-full xl:col-span-2">
          <Link href="/" className="ml-2 font-bold text-2xl flex">
            <LogoIcon />
            LEAD/DASHBOARD
          </Link>
          <h3 className="text-center">
            {t('policy')}
            <a
              target="_blank"
              href="https://gpthelp.ru"
              className="text-primary transition-all border-primary hover:border-b-2 ml-1"
            >
              LEAD/DASHBOARD
            </a>
            , {t('year')}
          </h3>
        </div>
      </section>
    </footer>
  );
};
