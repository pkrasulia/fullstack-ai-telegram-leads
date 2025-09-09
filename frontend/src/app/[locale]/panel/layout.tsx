'use client';
import React, { ReactNode, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  Users,
  Triangle,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import useAuthActions from '@/services/auth/use-auth-actions';
import { TopNavigationMenu } from '@/components/navigation-menu';

import ColorThemeSwitcher from '@/components/color-theme-switcher';
import { Loader } from '@/components/loader';

interface PanelLayoutProps {
  children: ReactNode;
}

function PanelLayout({ children }: PanelLayoutProps) {
  const pathname = usePathname();
  const { logOut } = useAuthActions();

  const [anchorElementNav, setAnchorElementNav] = useState<null | HTMLElement>(
    null,
  );
  const [anchorElementUser, setAnchorElementUser] =
    useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElementNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElementUser(null);
  };

  const activeLink = useMemo(() => {
    const links = [
      '/panel/leads',
    ];
    return links.find((link) => pathname.includes(link)) || null;
  }, [pathname]);

  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            <Triangle className="size-5 fill-foreground" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <Link href="./leads">
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/panel/leads' ? 'bg-muted' : ''}`}
                    aria-label="Leads"
                  >
                    <Users className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Лиды
                </TooltipContent>
              </Link>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">Telegram Leads</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => {
                logOut();
                handleCloseUserMenu();
              }}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm"
            >
              <LogOut className="size-3.5" />
              Выйти
            </Button>
            <ColorThemeSwitcher />
          </div>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export default PanelLayout;
