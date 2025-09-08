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
  Search,
  Filter,
  Plus,
  Building2,
  User,
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
  id: number;
  name: string;
  email?: string;
  phone?: string;
  telegramUsername?: string;
  telegramId?: string;
  company?: string;
  position?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: 'telegram' | 'website' | 'referral' | 'social_media' | 'other';
  createdAt: string;
  updatedAt: string;
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
        description: `${selectedLead.name} удален из базы`,
        action: {
          label: 'Отменить',
          onClick: () => console.log('Undo delete'),
        },
      });
      setSelectedLead(null);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Лиды</h1>
          <p className="text-muted-foreground">
            Управление лидами из Telegram и других источников
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Добавить лида
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего лидов</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              +18% к прошлому месяцу
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Новые</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              +12% за неделю
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +32% к прошлому месяцу
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсия</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.1%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% за месяц
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
                  <span>{selectedLead.name}</span>
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
                  {selectedLead.telegramUsername && (
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
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Имя</label>
                    <p className="text-sm font-medium">{selectedLead.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Статус</label>
                      <p className="text-sm capitalize">{selectedLead.status}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Источник</label>
                      <p className="text-sm capitalize">{selectedLead.source}</p>
                    </div>
                  </div>

                  {(selectedLead.company || selectedLead.position) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedLead.company && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Компания</label>
                          <p className="text-sm">{selectedLead.company}</p>
                        </div>
                      )}
                      {selectedLead.position && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Должность</label>
                          <p className="text-sm">{selectedLead.position}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {selectedLead.email && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{selectedLead.email}</p>
                      </div>
                    )}
                    {selectedLead.phone && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Телефон</label>
                        <p className="text-sm">{selectedLead.phone}</p>
                      </div>
                    )}
                    {selectedLead.telegramUsername && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Telegram</label>
                        <p className="text-sm">{selectedLead.telegramUsername}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedLead.notes && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Заметки</label>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{selectedLead.notes}</p>
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
      </div>
    </main>
  );
}

export default withPageRequiredAuth(LeadsPage);
