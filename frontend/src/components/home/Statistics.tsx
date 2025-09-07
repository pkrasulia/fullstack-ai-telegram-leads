'use client';

import { useTranslations } from 'next-intl';

export const Statistics = () => {
  const t = useTranslations('home.about.statistics');

  interface statsProps {
    quantity: string;
    description: string;
  }

  const stats: statsProps[] = [
    {
      quantity: t('items.0.quantity'),
      description: t('items.0.description'),
    },
    {
      quantity: t('items.1.quantity'),
      description: t('items.1.description'),
    },
    {
      quantity: t('items.2.quantity'),
      description: t('items.2.description'),
    },
    {
      quantity: t('items.3.quantity'),
      description: t('items.3.description'),
    },
  ];

  return (
    <section id="statistics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(({ quantity, description }: statsProps) => (
          <div key={description} className="space-y-2 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold ">{quantity}</h2>
            <p className="text-xl text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
