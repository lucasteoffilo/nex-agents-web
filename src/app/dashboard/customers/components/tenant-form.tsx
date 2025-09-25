'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tenant } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  parentTenantId: z.string().optional(),
  plan: z.enum(['free', 'pro', 'enterprise']),
  isActive: z.boolean().default(true),
  settings: z.object({
    allowRegistration: z.boolean().default(false),
    maxUsers: z.number().min(1).default(5),
    maxAgents: z.number().min(1).default(3),
    maxDocuments: z.number().min(1).default(10),
  }).optional(),
  metadata: z.object({
    industry: z.string().optional(),
    size: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    contactInfo: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  }).optional(),
});

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  parentTenantId?: string;
  isEditing?: boolean;
}

export function TenantForm({ 
  tenant, 
  onSubmit, 
  onCancel, 
  parentTenantId,
  isEditing = false 
}: TenantFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tenant?.name || '',
      slug: tenant?.slug || '',
      parentTenantId: tenant?.parentTenantId || parentTenantId || '',
      plan: tenant?.plan || 'free',
      isActive: tenant?.isActive ?? true,
      settings: {
        allowRegistration: tenant?.settings?.allowRegistration || false,
        maxUsers: tenant?.settings?.maxUsers || 5,
        maxAgents: tenant?.settings?.maxAgents || 3,
        maxDocuments: tenant?.settings?.maxDocuments || 10,
      },
      metadata: {
        industry: tenant?.metadata?.industry || '',
        size: tenant?.metadata?.size || 'small',
        country: tenant?.metadata?.country || '',
        timezone: tenant?.metadata?.timezone || 'America/Sao_Paulo',
        contactInfo: {
          email: tenant?.metadata?.contactInfo?.email || '',
          phone: tenant?.metadata?.contactInfo?.phone || '',
          address: tenant?.metadata?.contactInfo?.address || '',
        },
      },
    },
  });

  const formData = watch();

  const onFormSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    if (!isEditing && !formData.slug) {
      setValue('slug', generateSlug(name));
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Informações Básicas</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input 
                id="name"
                placeholder="Nome da empresa" 
                {...register('name')}
                onChange={handleNameChange}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Nome completo da empresa ou organização
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug"
                placeholder="nome-da-empresa" 
                {...register('slug')}
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Identificador único usado em URLs. Letras minúsculas, números e hífens apenas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select 
                onValueChange={(value) => setValue('plan', value as any)}
                defaultValue={formData.plan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              {errors.plan && (
                <p className="text-sm text-red-500">{errors.plan.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Plano de assinatura do cliente
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Cliente ativo no sistema
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Configurações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Máximo de Usuários</Label>
              <Input 
                id="maxUsers"
                type="number" 
                min="1" 
                {...register('settings.maxUsers', { valueAsNumber: true })}
              />
              {errors.settings?.maxUsers && (
                <p className="text-sm text-red-500">{errors.settings.maxUsers.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Número máximo de usuários permitidos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAgents">Máximo de Agentes</Label>
              <Input 
                id="maxAgents"
                type="number" 
                min="1" 
                {...register('settings.maxAgents', { valueAsNumber: true })}
              />
              {errors.settings?.maxAgents && (
                <p className="text-sm text-red-500">{errors.settings.maxAgents.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Número máximo de agentes permitidos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDocuments">Máximo de Documentos</Label>
              <Input 
                id="maxDocuments"
                type="number" 
                min="1" 
                {...register('settings.maxDocuments', { valueAsNumber: true })}
              />
              {errors.settings?.maxDocuments && (
                <p className="text-sm text-red-500">{errors.settings.maxDocuments.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Número máximo de documentos permitidos
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Permitir Registro</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que usuários se registrem automaticamente
                </p>
              </div>
              <Switch
                checked={formData.settings?.allowRegistration}
                onCheckedChange={(checked) => setValue('settings.allowRegistration', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold">Informações Adicionais</h3>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Indústria</Label>
              <Input 
                id="industry"
                placeholder="Tecnologia, Saúde, Educação..." 
                {...register('metadata.industry')}
              />
              <p className="text-sm text-muted-foreground">
                Setor de atuação da empresa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Select 
                onValueChange={(value) => setValue('metadata.size', value as any)}
                defaultValue={formData.metadata?.size}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequena (1-50)</SelectItem>
                  <SelectItem value="medium">Média (51-200)</SelectItem>
                  <SelectItem value="large">Grande (201-1000)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Tamanho aproximado da empresa
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contato</Label>
              <Input 
                id="contactEmail"
                type="email" 
                placeholder="contato@empresa.com" 
                {...register('metadata.contactInfo.email')}
              />
              <p className="text-sm text-muted-foreground">
                Email principal para contato
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input 
                id="contactPhone"
                placeholder="+55 (11) 99999-9999" 
                {...register('metadata.contactInfo.phone')}
              />
              <p className="text-sm text-muted-foreground">
                Telefone para contato
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactAddress">Endereço</Label>
              <Textarea 
                id="contactAddress"
                placeholder="Av. Paulista, 1000 - São Paulo/SP" 
                {...register('metadata.contactInfo.address')}
              />
              <p className="text-sm text-muted-foreground">
                Endereço físico da empresa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}