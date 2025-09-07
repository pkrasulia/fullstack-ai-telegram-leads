'use client';
import Link from 'next/link';
import useAuth from '@/services/auth/use-auth';
import { useAppSelector, useAppDispatch, useAppStore } from '@/lib/hooks';
import withPageRequiredAuth from '@/services/auth/with-page-required-auth';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  MessageCircle,
  Phone,
  Mail,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SheetClose, SheetFooter } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { LeadList } from '@/components/leads/lead-list';
import { useState } from 'react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  email?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lastActivity: string;
  createdAt: string;
  telegramId?: string;
  notes?: string;
}

function LeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { user: authUser } = useAuth();
  const store = useAppStore();
  const dispatch = useAppDispatch();

  const handleLeadImport = () => {
    toast('Импорт лидов', {
      description: 'Функция импорта лидов будет добавлена позже',
      action: {
        label: 'Понятно',
        onClick: () => console.log('Import leads'),
      },
    });
  };

  const handleLeadDelete = () => {
    if (selectedLead) {
      toast('Лид удален', {
        description: `${selectedLead.firstName} ${selectedLead.lastName} удален из базы`,
        action: {
          label: 'Отменить',
          onClick: () => console.log('Undo delete'),
        },
      });
      setSelectedLead(null);
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 mt-10">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
            <CardHeader className="pb-3">
              <CardTitle>Воронка продаж</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Аналитика конверсий по этапам воронки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">67</div>
                  <div className="text-xs text-muted-foreground">Обработка</div>
                  <div className="text-xs text-green-600">+18%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">37</div>
                  <div className="text-xs text-muted-foreground">Квалиф.</div>
                  <div className="text-xs text-green-600">+15%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">23</div>
                  <div className="text-xs text-muted-foreground">Конверсия</div>
                  <div className="text-xs text-green-600">+32%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">15</div>
                  <div className="text-xs text-muted-foreground">Отказы</div>
                  <div className="text-xs text-red-600">-5%</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Конверсия обработка → квалиф.</span>
                  <span className="font-medium">55.2%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Конверсия квалиф. → продажа</span>
                  <span className="font-medium">62.1%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Общая конверсия</span>
                  <span className="font-medium text-green-600">34.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-05-chunk-1">
            <CardHeader className="pb-2">
              <CardDescription>Всего лидов</CardDescription>
              <CardTitle className="text-4xl">127</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +18% к прошлому месяцу
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={18} aria-label="18% increase" />
            </CardFooter>
          </Card>
          <Card x-chunk="dashboard-05-chunk-2">
            <CardHeader className="pb-2">
              <CardDescription>Конверсии</CardDescription>
              <CardTitle className="text-4xl">23</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +32% к прошлому <br />
                месяцу
              </div>
            </CardContent>
            <CardFooter>
              <Progress value={32} aria-label="32% increase" />
            </CardFooter>
          </Card>
        </div>
        <LeadList selectedLead={selectedLead} onLeadSelect={setSelectedLead} />
      </div>
      <div style={{ position: 'sticky', top: '70px' }}>
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="group flex items-center gap-2 text-lg">
                Карточка лида
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy Lead ID</span>
                </Button>
              </CardTitle>
              <CardDescription>
                {selectedLead ? (
                  <span>{selectedLead.firstName} {selectedLead.lastName}</span>
                ) : (
                  <span>Лид не выбран</span>
                )}
              </CardDescription>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {selectedLead && (
                <>
                  {selectedLead.phone && (
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                        Позвонить
                      </span>
                    </Button>
                  )}
                  {selectedLead.username && (
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                        Telegram
                      </span>
                    </Button>
                  )}
                  {selectedLead.email && (
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                        Email
                      </span>
                    </Button>
                  )}
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={!selectedLead}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Редактировать</DropdownMenuItem>
                  <DropdownMenuItem>Изменить статус</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLeadDelete}>
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            {selectedLead ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Имя</label>
                    <p className="text-sm">{selectedLead.firstName} {selectedLead.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Статус</label>
                    <p className="text-sm capitalize">{selectedLead.status}</p>
                  </div>
                  {selectedLead.username && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Telegram</label>
                      <p className="text-sm">{selectedLead.username}</p>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Телефон</label>
                      <p className="text-sm">{selectedLead.phone}</p>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Email</label>
                      <p className="text-sm">{selectedLead.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Источник</label>
                    <p className="text-sm">{selectedLead.source}</p>
                  </div>
                </div>
                {selectedLead.notes && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Заметки</label>
                    <p className="text-sm mt-1">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Выберите лида из списка для просмотра деталей</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
            {selectedLead ? (
              <div className="text-xs text-muted-foreground">
                Создан{' '}
                <time dateTime={selectedLead.createdAt}>
                  {new Date(selectedLead.createdAt).toLocaleDateString(
                    'ru-RU',
                    {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    },
                  )}
                </time>
              </div>
            ) : (
              <></>
            )}
            <Pagination className="ml-auto mr-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Previous Lead</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="h-6 w-6">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="sr-only">Next Lead</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

export default withPageRequiredAuth(LeadsPage);
