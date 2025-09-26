'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, X, RefreshCw } from 'lucide-react';
import { CreateContactActivityDto } from '@/services/contact-activity-service';

interface ActivityFormProps {
  contactId: string;
  userId: string;
  onCreateActivity: (activity: CreateContactActivityDto) => Promise<void>;
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'note', label: 'Anotação' },
  { value: 'task', label: 'Tarefa' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'demo', label: 'Demonstração' },
];

export function ActivityForm({ contactId, userId, onCreateActivity }: ActivityFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateContactActivityDto>({
    title: '',
    description: '',
    type: 'note',
    activityDate: new Date().toISOString().slice(0, 16),
    userId,
    contactId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onCreateActivity(formData);
      setFormData({
        title: '',
        description: '',
        type: 'note',
        activityDate: new Date().toISOString().slice(0, 16),
        userId,
        contactId,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      type: 'note',
      activityDate: new Date().toISOString().slice(0, 16),
      userId,
      contactId,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Atividade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
          <DialogDescription>
            Registre uma nova interação com este contato
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Ligação de follow-up"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDate">Data e Hora *</Label>
            <Input
              id="activityDate"
              type="datetime-local"
              value={formData.activityDate}
              onChange={(e) => setFormData(prev => ({ ...prev, activityDate: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que aconteceu nesta interação..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Atividade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
