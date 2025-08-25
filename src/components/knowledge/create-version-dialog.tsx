'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  FileText,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useDocumentVersions } from '@/hooks/use-document-versions';

interface CreateVersionDialogProps {
  documentId: string;
  currentVersion: number;
  onVersionCreated?: () => void;
  trigger?: React.ReactNode;
}

interface ChangeItem {
  id: string;
  text: string;
}

export function CreateVersionDialog({ 
  documentId, 
  currentVersion, 
  onVersionCreated,
  trigger 
}: CreateVersionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [newChange, setNewChange] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createVersion, isCreatingVersion, error } = useDocumentVersions(documentId);

  const addChange = () => {
    if (newChange.trim()) {
      const change: ChangeItem = {
        id: Date.now().toString(),
        text: newChange.trim()
      };
      setChanges(prev => [...prev, change]);
      setNewChange('');
    }
  };

  const removeChange = (id: string) => {
    setChanges(prev => prev.filter(change => change.id !== id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (changes.length === 0) {
      newErrors.changes = 'Adicione pelo menos uma alteração';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createVersion({
        title: title.trim(),
        description: description.trim(),
        changes: changes.map(change => change.text)
      });

      // Reset form
      setTitle('');
      setDescription('');
      setChanges([]);
      setNewChange('');
      setErrors({});
      setOpen(false);

      onVersionCreated?.();
    } catch (err) {
      console.error('Erro ao criar versão:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addChange();
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nova Versão
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Criar Nova Versão
          </DialogTitle>
          <DialogDescription>
            Crie uma nova versão do documento com as alterações realizadas.
            Versão atual: <Badge variant="secondary">v{currentVersion}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Versão *</Label>
            <Input
              id="title"
              placeholder="Ex: Versão 2.1 - Correções e melhorias"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva as principais alterações desta versão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Lista de Alterações */}
          <div className="space-y-2">
            <Label>Alterações Realizadas *</Label>
            
            {/* Input para nova alteração */}
            <div className="flex gap-2">
              <Input
                placeholder="Descreva uma alteração..."
                value={newChange}
                onChange={(e) => setNewChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addChange}
                disabled={!newChange.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de alterações adicionadas */}
            {changes.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {changes.map((change) => (
                  <div key={change.id} className="flex items-start gap-2 group">
                    <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                    <span className="flex-1 text-sm">{change.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChange(change.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {errors.changes && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.changes}
              </p>
            )}
          </div>

          {/* Informações da versão */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Informações da Nova Versão
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span>Versão: v{currentVersion + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Autor: Você</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-3 w-3" />
                <span>Alterações: {changes.length}</span>
              </div>
            </div>
          </div>

          {/* Erro da API */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isCreatingVersion}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isCreatingVersion}
          >
            {isCreatingVersion ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Criar Versão
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}