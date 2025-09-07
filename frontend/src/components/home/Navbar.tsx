'use client';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { buttonVariants } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { LogoIcon } from './Icons';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import ColorThemeSwitcher from '@/components/color-theme-switcher';
import { usePathname } from 'next/navigation';
import { ComboboxForm } from '../change-language';
interface RouteProps {
  href: string;
  label: string;
}

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations('navbar');
  const currentLocale = useLocale();
  const pathname = usePathname();

  const routeList: RouteProps[] = [
    {
      href: '#about',
      label: t('routes.about'),
    },
    {
      href: '#testimonials',
      label: t('routes.testimonials'),
    },
    {
      href: '#pricing',
      label: t('routes.pricing'),
    },
    {
      href: '#faq',
      label: t('routes.faq'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/75 dark:bg-background/75 border-b border-slate-200 dark:border-slate-700">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 flex justify-between ">
          <NavigationMenuItem className="font-bold flex">
            <Link href="/" className="ml-2 font-bold text-xl flex">
              <LogoIcon />
              {t('logo')}
            </Link>
          </NavigationMenuItem>

          {/* mobile */}
          <span className="flex md:hidden">
            {/* <ModeToggle /> */}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              {/* <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger> */}

              <SheetContent side={'left'}>
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    {t('logo')}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }: RouteProps) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: 'ghost' })}
                    >
                      {label}
                    </a>
                  ))}
                  <a
                    href="https://github.com/leoMirandaa/shadcn-landing-page.git"
                    target="_blank"
                    className={`w-[110px] border ${buttonVariants({
                      variant: 'secondary',
                    })}`}
                  >
                    <GitHubLogoIcon className="mr-2 w-5 h-5" />
                    Github
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* desktop */}
          {pathname === `/${currentLocale}` ? (
            <nav className="hidden md:flex gap-2">
              {routeList.map((route: RouteProps, i) => (
                <a
                  href={route.href}
                  key={i}
                  className={`text-[17px] ${buttonVariants({
                    variant: 'ghost',
                  })}`}
                >
                  {route.label}
                </a>
              ))}
            </nav>
          ) : (
            <div></div>
          )}

          <div className="flex">
            <div className="hidden md:flex gap-2">
              <Link
                href={`/${currentLocale}/auth/sign-in`}
                className={`mr-2 border ${buttonVariants({ variant: 'secondary' })}`}
              >
                <LogIn className="mr-2 w-5 h-5" />
                {t('buttons.signIn')}
              </Link>

              {/* <ModeToggle /> */}
            </div>
            <div className="hidden md:flex gap-2">
              <Link
                href={`/${currentLocale}/auth/sign-up`}
                className={`border ${buttonVariants({ variant: 'secondary' })}`}
              >
                <UserPlus className="mr-2 w-5 h-5" />
                {t('buttons.signUp')}
              </Link>

              {/* <ComboboxForm /> */}
              <ColorThemeSwitcher />

              {/* <ModeToggle /> */}
            </div>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
