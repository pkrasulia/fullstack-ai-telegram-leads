'use client';
import { useRouter } from 'next/navigation';
import useAuth from './use-auth';
import React, { FunctionComponent, useEffect } from 'react';
import { RoleEnum } from '../api/types/role';
import { useLocale } from 'next-intl';

type PropsType = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type OptionsType = {
  roles: RoleEnum[];
};

const roles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value)),
) as RoleEnum[];

function withPageRequiredAuth(
  Component: FunctionComponent<PropsType>,
  options?: OptionsType,
) {
  const optionRoles = options?.roles || roles;
  return function WithPageRequiredAuth(props: PropsType) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();
    const language = useLocale();

    useEffect(() => {
      const check = () => {
        if (
          (user && user?.role?.id && optionRoles.includes(user?.role.id)) ||
          !isLoaded
        )
          return;

        const currentLocation = window.location.toString();
        const returnToPath =
          currentLocation.replace(new URL(currentLocation).origin, '') ||
          `/${language}`;
        const params = new URLSearchParams({
          returnTo: returnToPath,
        });

        let redirectTo = `/${language}/auth/sign-in?${params.toString()}`;

        if (user) {
          redirectTo = `/${language}`;
        }

        router.replace(redirectTo);
      };

      check();
    }, [user, isLoaded, router, language]);

    return user && user?.role?.id && optionRoles.includes(user?.role.id) ? (
      <Component {...props} />
    ) : null;
  };
}

export default withPageRequiredAuth;
