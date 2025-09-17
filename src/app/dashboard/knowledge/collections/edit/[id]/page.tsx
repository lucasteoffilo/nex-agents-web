'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Loader2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import collectionService, { Collection } from '@/services/collection-service';
import { toast } from 'sonner';

interface EditCollectionForm {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  embeddingConfig?: {
    model?: string;
    dimensions?: number;
    distance?: 'Cosine' | 'Euclidean' | 'Dot';
    provider?: 'openai' | 'huggingface' | 'local';
    customParams?: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState<EditCollectionForm>({
    name: '',
    description: '',
    isPublic: false,
    tags: [],
    embeddingConfig: {},
    metadata: {}
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      const data = await collectionService.getCollection(collectionId);
      setCollection(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        isPublic: data.settings?.isPublic || false,
        tags: data.metadata?.tags || [],
        metadata: data.metadata || {}
      });
    } catch (error) {
      console.error('Erro ao carregar coleção:', error);
      toast.error('Erro ao carregar coleção');
      router.push('/dashboard/knowledge/collections');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const name = formData.name || '';
    const description = formData.description || '';
    
    if (!name.trim()) {
      toast.error('Nome da coleção é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await collectionService.updateCollection(collectionId, {
        name: name.trim(),
        description: description.trim(),
        settings: {
          isPublic: formData.isPublic
        },
        tags: formData.tags,
        metadata: formData.metadata
      });
      
      toast.success('Coleção atualizada com sucesso!');
      router.push(`/dashboard/knowledge/collections/${collectionId}`);
    } catch (error) {
      console.error('Erro ao atualizar coleção:', error);
      toast.error('Erro ao atualizar coleção. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = (tagInput || '').trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando coleção...</span>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Coleção não encontrada</p>
          <Link href="/dashboard/knowledge/collections">
            <Button className="mt-4">
              Voltar às Coleções
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/knowledge/collections/${collectionId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Editar Coleção</h1>
          <p className="text-muted-foreground">
            Modifique as configurações da sua coleção
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure o nome e descrição da coleção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Coleção</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da coleção"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito desta coleção"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                }
              />
              <Label htmlFor="isPublic">Tornar coleção pública</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Adicione tags para organizar e categorizar sua coleção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Digite uma tag"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/dashboard/knowledge/collections/${collectionId}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}