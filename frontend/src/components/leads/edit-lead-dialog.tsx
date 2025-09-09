'use client';

import React, { useState, useEffect } from 'react';
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

export function EditLeadDialog({ lead, open, onOpenChange, onLeadUpdated }: EditLeadDialogProps) {
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead) return;
    
    if (!formData.name.trim()) {
      toast.error('Ошибка валидации', {
        description: 'Имя лида обязательно для заполнения'
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
        }
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
      
      toast.success('Лид обновлен', {
        description: `Информация о ${formData.name} успешно сохранена`
      });
      
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Ошибка сохранения', {
        description: 'Не удалось сохранить изменения'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabels = {
    [LeadStatus.NEW]: 'Новый',
    [LeadStatus.CONTACTED]: 'Контакт',
    [LeadStatus.QUALIFIED]: 'Квалифицирован',
    [LeadStatus.CONVERTED]: 'Конверсия',
    [LeadStatus.LOST]: 'Потерян'
  };

  const sourceLabels = {
    [LeadSource.TELEGRAM]: 'Telegram',
    [LeadSource.WEBSITE]: 'Сайт',
    [LeadSource.REFERRAL]: 'Реферал',
    [LeadSource.SOCIAL_MEDIA]: 'Соц. сети',
    [LeadSource.OTHER]: 'Другое'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать лида</DialogTitle>
          <DialogDescription>
            Измените информацию о лиде и нажмите "Сохранить"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Введите имя лида"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 999 123 45 67"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegramUsername">Telegram Username</Label>
              <Input
                id="telegramUsername"
                value={formData.telegramUsername}
                onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Компания</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Название компании"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Должность"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
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
              <Label htmlFor="source">Источник</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите источник" />
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
            <Label htmlFor="telegramId">Telegram ID</Label>
            <Input
              id="telegramId"
              value={formData.telegramId}
              onChange={(e) => handleInputChange('telegramId', e.target.value)}
              placeholder="123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Дополнительная информация о лиде..."
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
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
