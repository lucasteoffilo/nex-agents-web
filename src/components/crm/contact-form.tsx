'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, User, Building, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { Contact, CreateContactDto, UpdateContactDto } from '@/services/contact-service';

interface ContactFormProps {
  contact?: Contact;
  onSave: (data: CreateContactDto | UpdateContactDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ContactForm({ contact, onSave, onCancel, loading = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    mobile: contact?.mobile || '',
    company: contact?.company || '',
    position: contact?.position || '',
    website: contact?.website || '',
    type: contact?.type || 'lead',
    status: contact?.status || 'active',
    leadSource: contact?.leadSource || '',
    leadScore: contact?.leadScore || 0,
    notes: contact?.notes || '',
    tags: contact?.tags || [],
    address: {
      street: contact?.address?.street || '',
      city: contact?.address?.city || '',
      state: contact?.address?.state || '',
      country: contact?.address?.country || 'Brasil',
      postalCode: contact?.address?.postalCode || ''
    }
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const child = field.split('.')[1] as keyof typeof formData.address;
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [child]: value
        }
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field as keyof typeof prev]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {contact ? 'Editar Contato' : 'Novo Contato'}
        </CardTitle>
        <CardDescription>
          {contact ? 'Atualize as informações do contato' : 'Adicione um novo contato ao seu CRM'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mobile">Celular</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">CEP</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Classificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Classificação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="customer">Cliente</SelectItem>
                    <SelectItem value="partner">Parceiro</SelectItem>
                    <SelectItem value="vendor">Fornecedor</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leadScore">Score (0-100)</Label>
                <Input
                  id="leadScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.leadScore}
                  onChange={(e) => handleInputChange('leadScore', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leadSource">Fonte</Label>
              <Input
                id="leadSource"
                value={formData.leadSource}
                onChange={(e) => handleInputChange('leadSource', e.target.value)}
                placeholder="Ex: Website, LinkedIn, Indicação..."
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notas</h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Adicione observações sobre este contato..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {contact ? 'Atualizar' : 'Criar'} Contato
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
