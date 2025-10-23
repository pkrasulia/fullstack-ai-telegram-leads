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
import { unknown, z } from 'zod';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthLoginService } from '@/services/api/services/auth';
import useAuthActions from '@/services/auth/use-auth-actions';
import useAuthTokens from '@/services/auth/use-auth-tokens';
import HTTP_CODES_ENUM from '@/services/api/types/http-codes';
import { useLocale } from 'next-intl';

import { SetStateAction } from 'react';

type PropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type SignInFormData = {
  email: string;
  password: string;
};

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export function ButtonLoading() {
  return (
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
    </Button>
  );
}

function Form() {
  const t = useTranslations('sign-in');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError('Неверный email или пароль');
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
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                {...register('email')}
              />
              {errors.email && <span>{errors.email.message?.toString()}</span>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
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
                Login
              </Button>
            )}
            {error && <div className="text-red-500">{error}</div>}
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/en/auth/sign-up" className="underline">
              Sign up
            </Link>
            <Link
              href={`/${currentLocale}/auth/forgot-password`}
              className="ml-auto inline-block text-sm underline mt-2"
            >
              Forgot your password?
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
