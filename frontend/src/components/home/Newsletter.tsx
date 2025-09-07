'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

export const Newsletter = () => {
  const t = useTranslations('home.newsletter');
  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <section id="newsletter">
      <hr className="w-11/12 mx-auto" />

      <div className="container py-24 sm:py-32">
        <h3 className="text-center text-4xl md:text-5xl font-bold max-w-7xl">
          {t('title')}{' '}
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            AI
          </span>
        </h3>
        <p className="text-xl text-muted-foreground text-center mt-4 mb-8">
          {t('description')}
        </p>

        <form
          className="flex flex-col w-full md:flex-row md:w-6/12 lg:w-4/12 mx-auto gap-4 md:gap-2"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder={t('placeholder')}
            className="bg-muted/50 dark:bg-muted/80 "
            aria-label="email"
          />
          <Button>{t('submitButton')}</Button>
        </form>
      </div>

      <hr className="w-11/12 mx-auto" />
    </section>
  );
};
