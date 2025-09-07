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

import { File, ListFilter, Phone, Mail, MessageCircle } from 'lucide-react';

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
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useState, useEffect } from 'react';

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

// Mock data for leads
const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Алексей',
    lastName: 'Иванов',
    username: '@alexivanov',
    phone: '+7 (999) 123-45-67',
    email: 'alex@example.com',
    source: 'Telegram',
    status: 'new',
    lastActivity: '2024-01-19T10:30:00Z',
    createdAt: '2024-01-19T10:30:00Z',
    telegramId: '123456789',
    notes: 'Интересуется продуктом, запросил демо'
  },
  {
    id: '2',
    firstName: 'Мария',
    lastName: 'Петрова',
    username: '@mariapetrova',
    phone: '+7 (999) 234-56-78',
    source: 'Telegram',
    status: 'contacted',
    lastActivity: '2024-01-18T15:45:00Z',
    createdAt: '2024-01-18T09:20:00Z',
    telegramId: '987654321',
    notes: 'Отправлено коммерческое предложение'
  },
  {
    id: '3',
    firstName: 'Дмитрий',
    lastName: 'Сидоров',
    username: '@dmitrysidorov',
    email: 'dmitry@company.ru',
    source: 'Telegram',
    status: 'qualified',
    lastActivity: '2024-01-17T12:15:00Z',
    createdAt: '2024-01-16T14:30:00Z',
    telegramId: '456789123',
    notes: 'Готов к покупке, обсуждаем условия'
  },
  {
    id: '4',
    firstName: 'Елена',
    lastName: 'Козлова',
    username: '@elenakozlova',
    phone: '+7 (999) 345-67-89',
    source: 'Telegram',
    status: 'converted',
    lastActivity: '2024-01-15T16:20:00Z',
    createdAt: '2024-01-10T11:45:00Z',
    telegramId: '789123456',
    notes: 'Успешная конверсия, клиент доволен'
  },
  {
    id: '5',
    firstName: 'Сергей',
    lastName: 'Морозов',
    username: '@sergeymorozov',
    source: 'Telegram',
    status: 'lost',
    lastActivity: '2024-01-14T09:10:00Z',
    createdAt: '2024-01-12T13:25:00Z',
    telegramId: '321654987',
    notes: 'Не подошла цена, ушел к конкурентам'
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

interface LeadListProps {
  selectedLead?: Lead | null;
  onLeadSelect?: (lead: Lead) => void;
}

export function LeadList({ selectedLead, onLeadSelect }: LeadListProps) {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [activeTab, setActiveTab] = useState('all');

  const filteredLeads = leads.filter(lead => {
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="new">Новые</TabsTrigger>
          <TabsTrigger value="active">Активные</TabsTrigger>
          <TabsTrigger value="converted">Конверсии</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-sm">
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
          <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Экспорт</span>
          </Button>
        </div>
      </div>
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
                      Последняя активность
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
                        <div className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {lead.username && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {lead.username}
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
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{lead.source}</Badge>
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
                        {new Date(lead.lastActivity).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
  );
}
