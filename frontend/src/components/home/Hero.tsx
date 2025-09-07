'use client';
import { Button } from '@/components/ui/button';
import { HeroCards } from './HeroCards';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const Hero = () => {
  const t = useTranslations('home.hero');
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              {t('titlePrefix')}
            </span>{' '}
            {t('titleSuffix')}
          </h1>{' '}
          {t('for')}{' '}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              {t('your')}
            </span>{' '}
            {t('bussines')}
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          {t('description')}
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/en/auth/sign-up">
            <Button className="w-full md:w-1/3">{t('startFreeButton')}</Button>
          </Link>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10 relative right-[50px]">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
