'use client';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Lead } from '@/services/api/types/lead';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  File,
  ListFilter,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Building2,
  User,
} from 'lucide-react';

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

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-red-100 text-red-800',
};

interface LeadListProps {
  leads: Lead[];
  loading?: boolean;
  selectedLead?: Lead | null;
  onLeadSelect?: (lead: Lead) => void;
}

export function LeadList({
  leads,
  loading = false,
  selectedLead,
  onLeadSelect,
}: LeadListProps) {
  const t = useTranslations('leads');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusLabels = {
    new: t('status.new'),
    contacted: t('status.contacted'),
    qualified: t('status.qualified'),
    converted: t('status.converted'),
    lost: t('status.lost'),
  };

  const sourceLabels = {
    telegram: t('source.telegram'),
    website: t('source.website'),
    referral: t('source.referral'),
    social_media: t('source.social_media'),
    other: t('source.other'),
  };

  const filteredLeads = leads.filter((lead) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by tab
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return lead.status === 'new';
    if (activeTab === 'active')
      return ['contacted', 'qualified'].includes(lead.status);
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
            placeholder={t('list.searchPlaceholder')}
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
                <span className="sr-only sm:not-sr-only">{t('list.filter')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('list.filterByStatus')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>{t('list.new')}</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>{t('status.contacted')}</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                {t('status.qualified')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>{t('list.converted')}</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-sm">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">{t('list.export')}</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{t('list.all')} ({leads.length})</TabsTrigger>
          <TabsTrigger value="new">
            {t('list.new')} ({leads.filter((l) => l.status === 'new').length})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t('list.active')} (
            {
              leads.filter((l) => ['contacted', 'qualified'].includes(l.status))
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="converted">
            {t('list.converted')} ({leads.filter((l) => l.status === 'converted').length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader className="px-7">
              <CardTitle>{t('list.myLeads')}</CardTitle>
              <CardDescription>{t('list.leadsFromTelegram')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('list.loading')}</p>
                </div>
              ) : filteredLeads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('list.contact')}</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {t('list.source')}
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        {t('list.status')}
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        {t('list.createdAt')}
                      </TableHead>
                      <TableHead className="text-right">{t('actions.contact')}</TableHead>
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
                                {lead.position && (
                                  <span>• {lead.position}</span>
                                )}
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
                          <Badge variant="outline">
                            {sourceLabels[lead.source]}
                          </Badge>
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
                            {new Date(lead.createdAt).toLocaleDateString(
                              'ru-RU',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleTimeString(
                              'ru-RU',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            {t('actions.contact')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('list.notFound')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('list.notFoundDescription')}
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
