'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Check, Linkedin, SendHorizontal, Send } from 'lucide-react';
import { LightBulbIcon } from './Icons';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import assistImg from '@/assets/assist2.jpg';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const HeroCards = () => {
  const t = useTranslations('home.hero.cards');

  return (
    <div className="hidden relative right-[10px] lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Testimonial */}
      <Card className="absolute w-[340px] -top-[15px] drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar>
            <AvatarImage alt="" src="https://github.com/shadcn.png" />
            <AvatarFallback>SH</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <CardTitle className="text-lg">{t('testimonial.name')}</CardTitle>
            <CardDescription>{t('testimonial.position')}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>{t('testimonial.text')}</CardContent>
      </Card>

      {/* Team */}
      <Card className="absolute right-[20px] top-4 w-80 flex flex-col justify-center items-center drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="mt-8 flex justify-center items-center pb-2">
          <img
            src={assistImg.src}
            alt="user avatar"
            className="absolute grayscale-[0%] -top-12 rounded-full w-24 h-24 aspect-square object-cover"
          />
          <CardTitle className="text-center">{t('assistant.name')}</CardTitle>
          <CardDescription className="font-normal text-primary">
            {t('assistant.position')}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center pb-2">
          <p>{t('assistant.description')}</p>
        </CardContent>

        <CardFooter>
          <div>
            <a
              href="#"
              target="_blank"
              title="Написать"
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
              })}
            >
              <span className="sr-only">{t('assistant.send_message')}</span>
              <SendHorizontal className="w-5 h-5" />
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Pricing */}
      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            {t('pricing.title')}
            <Badge variant="secondary" className="text-sm text-primary">
              {t('pricing.badge')}
            </Badge>
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">0</span>
            <span className="text-muted-foreground">
              {' '}
              / {t('pricing.period')}
            </span>
          </div>

          <CardDescription>{t('pricing.priceDescription')}</CardDescription>
        </CardHeader>

        <CardContent>
          <Link href="/en/auth/sign-up">
            <Button className="w-full">{t('pricing.ctaButton')}</Button>
          </Link>
        </CardContent>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {[
              t('pricing.benefits.unlimited_requests'),
              t('pricing.benefits.unlimited_assistants'),
              t('pricing.benefits.unlimited_domains'),
            ].map((benefit: string) => (
              <span key={benefit} className="flex">
                <Check className="text-green-500" />{' '}
                <h3 className="ml-2">{benefit}</h3>
              </span>
            ))}
          </div>
        </CardFooter>
      </Card>

      {/* Service */}
      <Card className="absolute w-[350px] -right-[10px] bottom-[35px]  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
          <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
            <LightBulbIcon />
          </div>
          <div>
            <CardTitle> {t('service.title')}</CardTitle>
            <CardDescription className="text-md mt-2">
              {t('service.description')}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};
