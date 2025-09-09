'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bird,
  Bot,
  LifeBuoy,
  Rabbit,
  ReceiptRussianRuble,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle,
  LayoutDashboard,
  MessageSquareCode,
  Send,
  LogOut,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Аналитика',
    href: '/docs/primitives/alert-dialog',
    description: 'Подробная статистика и метрики по всем процессам',
  },
];
export function TopNavigationMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Быстрый старт</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/en/panel/assistants"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Создайте ассистента
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Ассистент это ваш виртуальный помощник который будет
                      интегрирован на ваш сайт или мессенджеры
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <Link href="/en/panel/integrations">
                <ListItem title="Добавьте канал связи">
                  Канал связи это ваши мессенджеры или чат на сайте через
                  который будет разговаривать ваш ассистент.
                </ListItem>
              </Link>
              <Link href="/en/panel/test-mode">
                <ListItem title="Обучите ассистента">
                  Загрузите инструкции которыми ассистент будет
                  руководствоваться
                </ListItem>
              </Link>
              <ListItem
                href="/docs/primitives/typography"
                title="Проверьте работу"
              >
                Краткая рекомендация после настройки
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Навигация</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
