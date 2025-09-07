'use client';
import React, { ReactNode, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
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
      '/en/panel/assistants',
      '/en/panel/integrations',
      '/en/panel/faq',
      '/en/panel/test-mode',
      '/en/panel/dashboard',
      '/en/panel/chats',
    ];
    return links.find((link) => pathname.startsWith(link)) || null;
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
              <Link href="./dashboard">
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/en/panel/dashboard' ? 'bg-muted' : ''}`}
                    aria-label="Assistants"
                  >
                    <LayoutDashboard className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Dashboard
                </TooltipContent>
              </Link>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <Link href="/en/panel/assistants">
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/en/panel/assistants' ? 'bg-muted' : ''}`}
                    aria-label="Assistants"
                  >
                    <Bot className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Assistants
                </TooltipContent>
              </Link>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <Link href="./integrations">
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/en/panel/integrations' ? 'bg-muted' : ''}`}
                    aria-label="Integrations"
                  >
                    <MessageSquareCode className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Integrations
                </TooltipContent>
              </Link>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <Link href="/en/panel/chats">
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/en/panel/chats' ? 'bg-muted' : ''}`}
                    aria-label="Assistants"
                  >
                    <Send className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                  Live Communication
                </TooltipContent>
              </Link>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/en/panel/test-mode">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-lg ${activeLink === '/en/panel/test-mode' ? 'bg-muted' : ''}`}
                    aria-label="Playground"
                  >
                    <SquareTerminal className="size-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Settings"
                >
                  <ReceiptRussianRuble className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Платежи
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/en/panel/faq">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-auto rounded-lg"
                    aria-label="Help"
                  >
                    <LifeBuoy className="size-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/en/panel/profile">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-auto rounded-lg"
                    aria-label="Account"
                  >
                    <SquareUser className="size-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">GPT/HELP </h1>
          <span className="text-xs">beta v1.0</span>
          <TopNavigationMenu />
          <Loader />
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <ReceiptRussianRuble className="size-4" />
                <span className="sr-only">Платежи</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model and messages.
                </DrawerDescription>
              </DrawerHeader>
              <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Settings324234
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="model">Assistants</Label>
                    <Select>
                      <SelectTrigger
                        id="assistants"
                        className="items-start [&_[data-description]]:hidden"
                      >
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="genesis">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Rabbit className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{' '}
                                <span className="font-medium text-foreground">
                                  Genesis
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Our fastest model for general use cases.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="explorer">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Bird className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{' '}
                                <span className="font-medium text-foreground">
                                  Explorer
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                Performance and speed for efficiency.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="quantum">
                          <div className="flex items-start gap-3 text-muted-foreground">
                            <Turtle className="size-5" />
                            <div className="grid gap-0.5">
                              <p>
                                Neural{' '}
                                <span className="font-medium text-foreground">
                                  Quantum
                                </span>
                              </p>
                              <p className="text-xs" data-description>
                                The most powerful model for complex
                                computations.
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input id="temperature" type="number" placeholder="0.4" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-p">Top P</Label>
                    <Input id="top-p" type="number" placeholder="0.7" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="top-k">Top K</Label>
                    <Input id="top-k" type="number" placeholder="0.0" />
                  </div>
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Messages
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue="system">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" placeholder="You are a..." />
                  </div>
                </fieldset>
              </form>
            </DrawerContent>
          </Drawer>
          <Button
            onClick={() => {
              logOut();
              handleCloseUserMenu();
            }}
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
          >
            <LogOut className="size-3.5" />
            Выйти
          </Button>
          <ColorThemeSwitcher />
        </header>
        {/* <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-1"> */}
        <main>{children}</main>
      </div>
    </div>
  );
}

export default PanelLayout;
