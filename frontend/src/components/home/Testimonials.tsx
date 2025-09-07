'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

export const Testimonials = () => {
  const t = useTranslations('home.testimonials');

  const testimonials: TestimonialProps[] = [
    {
      image: 'https://github.com/shadcn.png',
      name: t('reviews.0.name'),
      userName: t('reviews.0.position'),
      comment: t('reviews.0.comment'),
    },
    {
      image: 'https://github.com/shadcn.png',
      name: t('reviews.1.name'),
      userName: t('reviews.1.position'),
      comment: t('reviews.1.comment'),
    },
    {
      image: 'https://github.com/shadcn.png',
      name: t('reviews.2.name'),
      userName: t('reviews.2.position'),
      comment: t('reviews.2.comment'),
    },
    {
      image: 'https://github.com/shadcn.png',
      name: t('reviews.3.name'),
      userName: t('reviews.3.position'),
      comment: t('reviews.3.comment'),
    },
    {
      image: 'https://github.com/shadcn.png',
      name: t('reviews.4.name'),
      userName: t('reviews.4.position'),
      comment: t('reviews.4.comment'),
    },
  ];

  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold">
        {t('titleSuffix')}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {' '}
          {t('titleAccent')}{' '}
        </span>
        {t('title')}
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        {t('description')}
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage alt="" src={image} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          ),
        )}
      </div>
    </section>
  );
};
