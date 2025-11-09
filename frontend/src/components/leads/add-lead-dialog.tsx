'use client';

import React, { useState } from 'react';
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
import { usePostLeadService } from '@/services/api/services/leads';
import { toast } from 'sonner';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated: (newLead: Lead) => void;
}

export function AddLeadDialog({
  open,
  onOpenChange,
  onLeadCreated,
}: AddLeadDialogProps) {
  const t = useTranslations('leads');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    telegramUsername: '',
    telegramId: '',
    company: '',
    position: '',
    notes: '',
    status: LeadStatus.NEW,
    source: LeadSource.TELEGRAM,
  });

  const [isLoading, setIsLoading] = useState(false);
  const postLeadService = usePostLeadService();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('toasts.validationError'), {
        description: t('toasts.nameRequired'),
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await postLeadService({
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
      });

      // Handle different response structures
      let newLead: Lead;
      if (response && typeof response === 'object' && 'data' in response) {
        newLead = response.data as Lead;
      } else if (Array.isArray(response)) {
        // If API returns array (shouldn't happen, but handle it)
        newLead = response[0] as Lead;
      } else {
        // If API returns the lead directly
        newLead = response as Lead;
      }

      // Save lead name for toast notification before resetting form
      const leadName = formData.name.trim();

      onLeadCreated(newLead);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        telegramUsername: '',
        telegramId: '',
        company: '',
        position: '',
        notes: '',
        status: LeadStatus.NEW,
        source: LeadSource.TELEGRAM,
      });

      onOpenChange(false);

      toast.success(t('toasts.leadCreated'), {
        description: t('toasts.leadCreatedDescription', { name: leadName }),
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error(t('toasts.saveError'), {
        description: t('toasts.saveErrorDescription'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      // Reset form when closing
      setFormData({
        name: '',
        email: '',
        phone: '',
        telegramUsername: '',
        telegramId: '',
        company: '',
        position: '',
        notes: '',
        status: LeadStatus.NEW,
        source: LeadSource.TELEGRAM,
      });
    }
    onOpenChange(newOpen);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('addDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('addDialog.name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('addDialog.namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('addDialog.email')}</Label>
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
              <Label htmlFor="phone">{t('addDialog.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={t('addDialog.phonePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramUsername">{t('addDialog.telegramUsername')}</Label>
              <Input
                id="telegramUsername"
                value={formData.telegramUsername}
                onChange={(e) =>
                  handleInputChange('telegramUsername', e.target.value)
                }
                placeholder={t('addDialog.telegramUsernamePlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">{t('addDialog.company')}</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder={t('addDialog.companyPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">{t('addDialog.position')}</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder={t('addDialog.positionPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">{t('addDialog.status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('addDialog.statusPlaceholder')} />
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
              <Label htmlFor="source">{t('addDialog.source')}</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleInputChange('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('addDialog.sourcePlaceholder')} />
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
            <Label htmlFor="telegramId">{t('addDialog.telegramId')}</Label>
            <Input
              id="telegramId"
              value={formData.telegramId}
              onChange={(e) => handleInputChange('telegramId', e.target.value)}
              placeholder={t('addDialog.telegramIdPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('addDialog.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('addDialog.notesPlaceholder')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t('addDialog.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('addDialog.creating') : t('addDialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

