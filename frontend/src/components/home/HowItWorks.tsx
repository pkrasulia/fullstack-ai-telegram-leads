'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MedalIcon,
  MapIcon,
  PlaneIcon,
  GiftIcon,
} from '@/components/home/Icons';
import { useTranslations } from 'next-intl';

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

export const HowItWorks = () => {
  const t = useTranslations('home.howItWorks');

  const features: FeatureProps[] = [
    {
      icon: <MedalIcon />,
      title: t('features.0.title'),
      description: t('features.0.description'),
    },
    {
      icon: <MapIcon />,
      title: t('features.1.title'),
      description: t('features.1.description'),
    },
    {
      icon: <PlaneIcon />,
      title: t('features.2.title'),
      description: t('features.2.description'),
    },
    {
      icon: <GiftIcon />,
      title: t('features.3.title'),
      description: t('features.3.description'),
    },
  ];

  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold ">
        {t('first')}{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {t('titleAccent')}{' '}
        </span>
        <br /> {t('title')}
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        {t('description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
