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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import {
  useAuthSignUpService,
  useAuthLoginService,
} from '@/services/api/services/auth';
import useAuthActions from '@/services/auth/use-auth-actions';
import useAuthTokens from '@/services/auth/use-auth-tokens';
import HTTP_CODES_ENUM from '@/services/api/types/http-codes';
import { useLocale } from 'next-intl';
import withPageRequiredGuest from '@/services/auth/with-page-required-guest';

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  telegram?: string;
  password: string;
};

const schema = z.object({
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  email: z.string().email('Invalid email address'),
  telegram: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

function SignUpPage() {
  const t = useTranslations('sign-up');
  const currentLocale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const fetchAuthSignUp = useAuthSignUpService();
  const fetchAuthLogin = useAuthLoginService();
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();

  const onSubmit: any = async (formData: SignUpFormData) => {
    setIsLoading(true);
    setError('');

    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(formData);

    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      // Handle validation errors
      setError('There was an error creating your account');
      return;
    }

    const { data: dataSignIn, status: statusSignIn } = await fetchAuthLogin({
      email: formData.email,
      password: formData.password,
    });

    if (statusSignIn === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: dataSignIn.token,
        refreshToken: dataSignIn.refreshToken,
        tokenExpires: dataSignIn.tokenExpires,
      });
      setUser(dataSignIn.user);
    } else {
      setError('There was an error signing in');
    }

    setIsLoading(false);
  };

  return (
    <Card className="mx-auto mt-10 max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">{t('firstName')}</Label>
                <Input
                  id="first-name"
                  placeholder="John"
                  required
                  {...register('firstName')}
                />
                {errors.firstName && typeof errors.firstName === 'string' && (
                  <span>{errors.firstName}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">{t('lastName')}</Label>
                <Input
                  id="last-name"
                  placeholder="Doe"
                  required
                  {...register('lastName')}
                />
                {errors.lastName && typeof errors.lastName === 'string' && (
                  <span>{errors.lastName}</span>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...register('email')}
              />
              {errors.email && typeof errors.email === 'string' && (
                <span>{errors.email}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && typeof errors.password === 'string' && (
                <span>{errors.password}</span>
              )}
            </div>
            {isLoading ? (
              <Button disabled className="w-full">
                Loading...
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                {t('createAccount')}
              </Button>
            )}
            {error && <div className="text-red-500">{error}</div>}
            <Button variant="outline" className="w-full">
              {t('signUpWithGoogle')}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            <Link href="/en/auth/sign-in" className="underline">
              {t('alreadyHaveAccount')}{' '}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default withPageRequiredGuest(SignUpPage);
