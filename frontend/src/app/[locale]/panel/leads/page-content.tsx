'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
import {
  useGetLeadsService,
  useGetLeadsByStatusService,
} from '@/services/api/services/leads';
import { Lead, LeadStatus } from '@/services/api/types/lead';
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
import { EditLeadDialog } from '@/components/leads/edit-lead-dialog';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

function LeadsPage() {
  const t = useTranslations('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    converted: 0,
    conversionRate: 0,
  });

  const { user: authUser } = useAuth();
  const store = useAppStore();
  const dispatch = useAppDispatch();
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const initialOffsetRef = useRef<number | null>(null);

  const getLeadsService = useGetLeadsService();
  const getNewLeadsService = useGetLeadsByStatusService();
  const getConvertedLeadsService = useGetLeadsByStatusService();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);

        // Fetch all leads
        const leadsResponse = await getLeadsService({ page: 1, limit: 100 });
        let allLeads: Lead[] = [];

        if (Array.isArray(leadsResponse)) {
          allLeads = leadsResponse;
        } else if (
          leadsResponse &&
          typeof leadsResponse === 'object' &&
          'data' in leadsResponse
        ) {
          allLeads = Array.isArray(leadsResponse.data)
            ? leadsResponse.data
            : [];
        }

        setLeads(allLeads);

        // Calculate stats from existing leads data
        const totalCount = allLeads.length;
        const newCount = allLeads.filter(
          (lead) => lead.status === LeadStatus.NEW,
        ).length;
        const convertedCount = allLeads.filter(
          (lead) => lead.status === LeadStatus.CONVERTED,
        ).length;
        const conversionRate =
          totalCount > 0 ? (convertedCount / totalCount) * 100 : 0;

        setStats({
          total: totalCount,
          new: newCount,
          converted: convertedCount,
          conversionRate: Math.round(conversionRate * 10) / 10,
        });
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast.error(t('toasts.errorLoading'), {
          description: t('toasts.errorLoadingDescription'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [getLeadsService, getNewLeadsService, getConvertedLeadsService, t]);

  useEffect(() => {
    if (!cardContainerRef.current) return;

    // Находим скроллящийся контейнер (main с overflow-auto)
    const scrollContainer = cardContainerRef.current.closest('main');
    if (!scrollContainer) return;

    // Инициализируем начальную позицию
    const initPosition = () => {
      if (cardContainerRef.current && initialOffsetRef.current === null) {
        const rect = cardContainerRef.current.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        initialOffsetRef.current = rect.top - containerRect.top;
      }
    };

    const handleScroll = () => {
      if (!cardContainerRef.current) return;

      // Инициализируем, если еще не инициализировано
      if (initialOffsetRef.current === null) {
        initPosition();
        return;
      }

      // Обновляем позицию карточки в зависимости от скролла
      const scrollTop = scrollContainer.scrollTop;
      
      // Используем transform для плавного движения вместе со скроллом
      cardContainerRef.current.style.transform = `translateY(${scrollTop}px)`;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    // Небольшая задержка для правильной инициализации после рендера
    setTimeout(initPosition, 100);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLeadImport = () => {
    toast(t('toasts.importLeads'), {
      description: t('toasts.importLeadsDescription'),
      action: {
        label: t('toasts.understood'),
        onClick: () => console.log('Import leads'),
      },
    });
  };

  const handleLeadEdit = () => {
    if (selectedLead) {
      setEditDialogOpen(true);
    }
  };

  const handleLeadUpdated = (updatedLead: Lead) => {
    // Update the lead in the leads array
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === updatedLead.id ? updatedLead : lead,
      ),
    );

    // Update selected lead if it's the same one
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }

    // Recalculate stats
    const updatedLeads = leads.map((lead) =>
      lead.id === updatedLead.id ? updatedLead : lead,
    );

    const totalCount = updatedLeads.length;
    const newCount = updatedLeads.filter(
      (lead) => lead.status === LeadStatus.NEW,
    ).length;
    const convertedCount = updatedLeads.filter(
      (lead) => lead.status === LeadStatus.CONVERTED,
    ).length;
    const conversionRate =
      totalCount > 0 ? (convertedCount / totalCount) * 100 : 0;

    setStats({
      total: totalCount,
      new: newCount,
      converted: convertedCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
    });
  };

  const handleLeadDelete = () => {
    if (selectedLead) {
      toast(t('toasts.leadDeleted'), {
        description: `${selectedLead.name} ${t('toasts.leadDeletedDescription')}`,
        action: {
          label: t('toasts.undo'),
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
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addLead')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.totalDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.new')}</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.new}
            </div>
            <p className="text-xs text-muted-foreground">{t('stats.newDescription')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadList
            leads={leads}
            loading={loading}
            selectedLead={selectedLead}
            onLeadSelect={setSelectedLead}
          />
        </div>
        <div 
          ref={cardContainerRef}
          className="self-start max-h-[calc(100vh-80px)] overflow-y-auto"
          style={{ willChange: 'transform' }}
        >
          <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="group flex items-center gap-2 text-lg">
                  {t('card.title')}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">{t('card.copyLeadId')}</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  {selectedLead ? (
                    <span>{selectedLead.name}</span>
                  ) : (
                    <span>{t('card.notSelected')}</span>
                  )}
                </CardDescription>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {selectedLead && (
                  <>
                    {selectedLead.telegramUsername && (
                      <Button size="sm" variant="outline" className="h-8 gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                          {t('actions.telegram')}
                        </span>
                      </Button>
                    )}
                    {selectedLead.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        asChild
                      >
                        <a href={`mailto:${selectedLead.email}`}>
                          <Mail className="h-3.5 w-3.5" />
                          <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                            {t('actions.email')}
                          </span>
                        </a>
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
                        <span className="sr-only">{t('actions.more')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleLeadEdit}>
                        {t('actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>{t('actions.changeStatus')}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLeadDelete}>
                        {t('actions.delete')}
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
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('fields.name')}
                      </label>
                      <p className="text-sm font-medium">{selectedLead.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('fields.status')}
                        </label>
                        <p className="text-sm capitalize">
                          {selectedLead.status}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          {t('fields.source')}
                        </label>
                        <p className="text-sm capitalize">
                          {selectedLead.source}
                        </p>
                      </div>
                    </div>

                    {(selectedLead.company || selectedLead.position) && (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedLead.company && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              {t('fields.company')}
                            </label>
                            <p className="text-sm">{selectedLead.company}</p>
                          </div>
                        )}
                        {selectedLead.position && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">
                              {t('fields.position')}
                            </label>
                            <p className="text-sm">{selectedLead.position}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      {selectedLead.email && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Email
                          </label>
                          <p className="text-sm">{selectedLead.email}</p>
                        </div>
                      )}
                      {selectedLead.phone && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            {t('fields.phone')}
                          </label>
                          <p className="text-sm">{selectedLead.phone}</p>
                        </div>
                      )}
                      {selectedLead.telegramUsername && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">
                            Telegram
                          </label>
                          <p className="text-sm">
                            {selectedLead.telegramUsername}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        {t('fields.notes')}
                      </label>
                      <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">
                        {selectedLead.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('card.selectLead')}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
              {selectedLead ? (
                <div className="text-xs text-muted-foreground">
                  {t('card.created')}{' '}
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
                      <span className="sr-only">{t('card.previousLead')}</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button size="icon" variant="outline" className="h-6 w-6">
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="sr-only">{t('card.nextLead')}</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </div>
      </div>

      <EditLeadDialog
        lead={selectedLead}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onLeadUpdated={handleLeadUpdated}
      />
    </main>
  );
}

export default withPageRequiredAuth(LeadsPage);
