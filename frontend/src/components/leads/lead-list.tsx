'use client';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { File, ListFilter, Phone, Mail, MessageCircle, Search, Building2, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useState, useEffect } from 'react';

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

// Mock data for leads
const mockLeads: Lead[] = [
  {
    id: 1,
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    phone: '+7 912 345 67 89',
    telegramUsername: '@ivan_petrov',
    telegramId: '123456789',
    company: 'TechSolutions',
    position: 'Frontend Developer',
    notes: 'Интересуется новыми технологиями, нужно отправить презентацию',
    status: 'new',
    source: 'telegram',
    createdAt: '2025-09-08T22:01:07.580Z',
    updatedAt: '2025-09-08T22:01:07.580Z'
  },
  {
    id: 2,
    name: 'Мария Сидорова',
    email: 'maria.sidorova@company.ru',
    phone: '+7 999 234 56 78',
    telegramUsername: '@maria_sidorova',
    telegramId: '987654321',
    company: 'Digital Agency',
    position: 'Marketing Manager',
    notes: 'Отправлено коммерческое предложение, ждем ответа',
    status: 'contacted',
    source: 'telegram',
    createdAt: '2025-09-07T15:30:00.000Z',
    updatedAt: '2025-09-08T10:15:00.000Z'
  },
  {
    id: 3,
    name: 'Алексей Козлов',
    email: 'alex.kozlov@startup.io',
    phone: '+7 985 123 45 67',
    telegramUsername: '@alex_kozlov',
    telegramId: '456789123',
    company: 'StartupIO',
    position: 'CTO',
    notes: 'Готов к покупке, обсуждаем технические детали',
    status: 'qualified',
    source: 'telegram',
    createdAt: '2025-09-06T12:00:00.000Z',
    updatedAt: '2025-09-08T14:20:00.000Z'
  },
  {
    id: 4,
    name: 'Елена Морозова',
    email: 'elena@bigcorp.com',
    phone: '+7 926 789 01 23',
    telegramUsername: '@elena_morozova',
    telegramId: '789123456',
    company: 'BigCorp',
    position: 'Product Owner',
    notes: 'Успешная конверсия, подписан контракт',
    status: 'converted',
    source: 'website',
    createdAt: '2025-09-05T09:30:00.000Z',
    updatedAt: '2025-09-08T16:45:00.000Z'
  },
  {
    id: 5,
    name: 'Дмитрий Волков',
    phone: '+7 903 456 78 90',
    telegramUsername: '@dmitry_volkov',
    telegramId: '321654987',
    company: 'FreelanceStudio',
    notes: 'Не подошла цена, ушел к конкурентам',
    status: 'lost',
    source: 'referral',
    createdAt: '2025-09-04T11:15:00.000Z',
    updatedAt: '2025-09-07T13:30:00.000Z'
  },
  {
    id: 6,
    name: 'Анна Белова',
    email: 'anna.belova@design.studio',
    telegramUsername: '@anna_belova',
    telegramId: '654321098',
    company: 'Design Studio',
    position: 'UI/UX Designer',
    notes: 'Заинтересована в долгосрочном сотрудничестве',
    status: 'new',
    source: 'social_media',
    createdAt: '2025-09-08T18:20:00.000Z',
    updatedAt: '2025-09-08T18:20:00.000Z'
  }
];

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800'
};

const statusLabels = {
  new: 'Новый',
  contacted: 'Контакт',
  qualified: 'Квалифицирован',
  converted: 'Конверсия',
  lost: 'Потерян'
};

const sourceLabels = {
  telegram: 'Telegram',
  website: 'Сайт',
  referral: 'Реферал',
  social_media: 'Соц. сети',
  other: 'Другое'
};

interface LeadListProps {
  selectedLead?: Lead | null;
  onLeadSelect?: (lead: Lead) => void;
}

export function LeadList({ selectedLead, onLeadSelect }: LeadListProps) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Filter by tab
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return lead.status === 'new';
    if (activeTab === 'active') return ['contacted', 'qualified'].includes(lead.status);
    if (activeTab === 'converted') return lead.status === 'converted';
    return true;
  });

  const handleLeadSelect = (lead: Lead) => {
    onLeadSelect?.(lead);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, email, компании..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Фильтр</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Фильтр по статусу</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Новые
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Контакт</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Квалифицированные</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Конверсии</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-sm">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Экспорт</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Все ({leads.length})</TabsTrigger>
          <TabsTrigger value="new">Новые ({leads.filter(l => l.status === 'new').length})</TabsTrigger>
          <TabsTrigger value="active">Активные ({leads.filter(l => ['contacted', 'qualified'].includes(l.status)).length})</TabsTrigger>
          <TabsTrigger value="converted">Конверсии ({leads.filter(l => l.status === 'converted').length})</TabsTrigger>
        </TabsList>
      <TabsContent value={activeTab}>
        <Card x-chunk="dashboard-05-chunk-3">
          <CardHeader className="px-7">
            <CardTitle>Мои лиды</CardTitle>
            <CardDescription>Список лидов из Telegram</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredLeads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Контакт</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Источник
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Статус
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Дата создания
                    </TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      onClick={() => handleLeadSelect(lead)}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        selectedLead?.id === lead.id
                          ? 'bg-muted border-l-4 border-l-primary'
                          : ''
                      }`}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{lead.name}</div>
                          {lead.company && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span>{lead.company}</span>
                              {lead.position && <span>• {lead.position}</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {lead.telegramUsername && (
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {lead.telegramUsername}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </span>
                            )}
                            {lead.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{sourceLabels[lead.source]}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge 
                          className={`text-xs ${statusColors[lead.status]}`}
                          variant="secondary"
                        >
                          {statusLabels[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {new Date(lead.createdAt).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Связаться
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Лиды не найдены</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Попробуйте изменить фильтры или добавить новых лидов
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  );
}
