'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead, LeadStatus, LeadSource } from '@/services/api/types/lead';
import { usePatchLeadService } from '@/services/api/services/leads';
import { toast } from 'sonner';

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadUpdated: (updatedLead: Lead) => void;
}

export function EditLeadDialog({
  lead,
  open,
  onOpenChange,
  onLeadUpdated,
}: EditLeadDialogProps) {
  const t = useTranslations('leads');
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    telegramUsername: lead?.telegramUsername || '',
    telegramId: lead?.telegramId || '',
    company: lead?.company || '',
    position: lead?.position || '',
    notes: lead?.notes || '',
    status: lead?.status || LeadStatus.NEW,
    source: lead?.source || LeadSource.TELEGRAM,
  });

  const [isLoading, setIsLoading] = useState(false);
  const patchLeadService = usePatchLeadService();

  // Update form data when lead changes
  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        telegramUsername: lead.telegramUsername || '',
        telegramId: lead.telegramId || '',
        company: lead.company || '',
        position: lead.position || '',
        notes: lead.notes || '',
        status: lead.status || LeadStatus.NEW,
        source: lead.source || LeadSource.TELEGRAM,
      });
    }
  }, [lead]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead) return;

    if (!formData.name.trim()) {
      toast.error(t('toasts.validationError'), {
        description: t('toasts.nameRequired'),
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await patchLeadService({
        id: lead.id,
        data: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          telegramUsername: formData.telegramUsername.trim() || undefined,
          telegramId: formData.telegramId.trim() || undefined,
          company: formData.company.trim() || undefined,
          position: formData.position.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          status: formData.status,
          source: formData.source,
        },
      });

      // Handle different response structures
      let updatedLead: Lead;
      if (response && typeof response === 'object' && 'data' in response) {
        updatedLead = response.data as Lead;
      } else {
        // If API returns the lead directly or we need to construct it
        updatedLead = {
          ...lead,
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          telegramUsername: formData.telegramUsername.trim() || undefined,
          telegramId: formData.telegramId.trim() || undefined,
          company: formData.company.trim() || undefined,
          position: formData.position.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          status: formData.status,
          source: formData.source,
          updatedAt: new Date().toISOString(),
        };
      }

      onLeadUpdated(updatedLead);
      onOpenChange(false);

      toast.success(t('toasts.leadUpdated'), {
        description: t('toasts.leadUpdatedDescription', { name: formData.name }),
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error(t('toasts.saveError'), {
        description: t('toasts.saveErrorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabels = {
    [LeadStatus.NEW]: t('status.new'),
    [LeadStatus.CONTACTED]: t('status.contacted'),
    [LeadStatus.QUALIFIED]: t('status.qualified'),
    [LeadStatus.CONVERTED]: t('status.converted'),
    [LeadStatus.LOST]: t('status.lost'),
  };

  const sourceLabels = {
    [LeadSource.TELEGRAM]: t('source.telegram'),
    [LeadSource.WEBSITE]: t('source.website'),
    [LeadSource.REFERRAL]: t('source.referral'),
    [LeadSource.SOCIAL_MEDIA]: t('source.social_media'),
    [LeadSource.OTHER]: t('source.other'),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('editDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('editDialog.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('editDialog.namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('editDialog.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('editDialog.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('editDialog.phonePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUsername">{t('editDialog.telegramUsername')}</Label>
              <Input
                id="telegramUsername"
                value={formData.telegramUsername}
                onChange={(e) =>
                  handleInputChange('telegramUsername', e.target.value)
                }
                placeholder={t('editDialog.telegramUsernamePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">{t('editDialog.company')}</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder={t('editDialog.companyPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t('editDialog.position')}</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder={t('editDialog.positionPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('editDialog.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('editDialog.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">{t('editDialog.source')}</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('editDialog.sourcePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegramId">{t('editDialog.telegramId')}</Label>
            <Input
              id="telegramId"
              value={formData.telegramId}
              onChange={(e) => handleInputChange('telegramId', e.target.value)}
              placeholder={t('editDialog.telegramIdPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('editDialog.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('editDialog.notesPlaceholder')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('editDialog.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('editDialog.saving') : t('editDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
