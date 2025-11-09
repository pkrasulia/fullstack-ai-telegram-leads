'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import withPageRequiredGuest from '@/services/auth/with-page-required-guest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthLoginService } from '@/services/api/services/auth';
import useAuthActions from '@/services/auth/use-auth-actions';
import useAuthTokens from '@/services/auth/use-auth-tokens';
import HTTP_CODES_ENUM from '@/services/api/types/http-codes';
import { useLocale } from 'next-intl';

type PropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type SignInFormData = {
  email: string;
  password: string;
};

export function ButtonLoading() {
  const t = useTranslations('sign-in');
  return (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('pleaseWait')}
    </Button>
  );
}

function Form() {
  const t = useTranslations('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const schema = z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(6, t('validation.passwordMin')),
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const fetchAuthLogin = useAuthLoginService();
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const currentLocale = useLocale();

  const onSubmit: any = async (data: SignInFormData) => {
    setIsLoading(true);
    setError('');

    const { data: responseData, status } = await fetchAuthLogin(data);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      // Обработка ошибок валидации
      setError(t('invalidCredentials'));
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: responseData.token,
        refreshToken: responseData.refreshToken,
        tokenExpires: responseData.tokenExpires,
      });
      setUser(responseData.user);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-20">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                required
                {...register('email')}
              />
              {errors.email && <span>{errors.email.message?.toString()}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('password')}</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                {...register('password')}
              />
              {errors.password && (
                <span>{errors.password.message?.toString()}</span>
              )}
            </div>
            {isLoading ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" className="w-full">
                {t('loginButton')}
              </Button>
            )}
            {error && <div className="text-red-500">{error}</div>}
            <Button variant="outline" className="w-full">
              {t('loginWithGoogle')}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('dontHaveAccount')}{' '}
            <Link href={`/${currentLocale}/auth/sign-up`} className="underline">
              {t('signUp')}
            </Link>
            <Link
              href={`/${currentLocale}/auth/forgot-password`}
              className="ml-auto inline-block text-sm underline mt-2"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function SignInPage(props: PropsType) {
  return <Form />;
}

export default withPageRequiredGuest(SignInPage);
