'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { toast } from 'sonner';
import documentService from '@/services/document-service';

interface DocumentFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface DocumentUploadProps {
  collectionId: string;
  onUploadComplete?: (documents: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // em bytes
  acceptedTypes?: string[];
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/json',
  'text/html',
  'application/rtf'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 10;

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return FileSpreadsheet;
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text')) return FileText;
  if (mimeType.includes('json') || mimeType.includes('html')) return FileCode;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DocumentUpload({
  collectionId,
  onUploadComplete,
  maxFiles = MAX_FILES,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES
}: DocumentUploadProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Verificar arquivos rejeitados
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`Arquivo "${file.name}" é muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`Tipo de arquivo "${file.name}" não é suportado.`);
        } else {
          toast.error(`Erro no arquivo "${file.name}": ${error.message}`);
        }
      });
    });

    // Verificar limite de arquivos
    const currentFileCount = files.length;
    const newFileCount = acceptedFiles.length;
    
    if (currentFileCount + newFileCount > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos.`);
      return;
    }

    // Adicionar arquivos aceitos
    const newFiles: DocumentFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Nenhum arquivo selecionado.');
      return;
    }

    setIsUploading(true);
    const uploadedDocuments: any[] = [];

    try {
      for (const documentFile of files) {
        if (documentFile.status !== 'pending') continue;

        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === documentFile.id 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        try {
          // Simular progresso de upload
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => {
              if (f.id === documentFile.id && f.progress < 90) {
                return { ...f, progress: f.progress + 10 };
              }
              return f;
            }));
          }, 200);

          // Fazer upload do documento
          const uploadedDoc = await documentService.uploadDocument({
            collectionId,
            file: documentFile.file,
            name: documentFile.file.name,
            description: `Documento enviado em ${new Date().toLocaleString()}`
          });

          clearInterval(progressInterval);

          // Atualizar status para success
          setFiles(prev => prev.map(f => 
            f.id === documentFile.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          ));

          uploadedDocuments.push(uploadedDoc);
          toast.success(`Documento "${documentFile.file.name}" enviado com sucesso!`);

        } catch (error: any) {
          // Atualizar status para error
          setFiles(prev => prev.map(f => 
            f.id === documentFile.id 
              ? { ...f, status: 'error', progress: 0, error: error.message }
              : f
          ));

          toast.error(`Erro ao enviar "${documentFile.file.name}": ${error.message}`);
        }
      }

      if (uploadedDocuments.length > 0 && onUploadComplete) {
        onUploadComplete(uploadedDocuments);
      }

    } finally {
      setIsUploading(false);
    }
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status === 'pending' || f.status === 'uploading'));
  };

  const hasFiles = files.length > 0;
  const hasCompletedFiles = files.some(f => f.status === 'success' || f.status === 'error');
  const pendingFiles = files.filter(f => f.status === 'pending');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Envie documentos para esta coleção. Tipos suportados: PDF, Word, Excel, TXT, Markdown, CSV, Imagens e mais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Drop */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-2">Arraste arquivos aqui ou clique para selecionar</p>
              <p className="text-sm text-muted-foreground">
                Máximo {maxFiles} arquivos, até {formatFileSize(maxSize)} cada
              </p>
            </div>
          )}
        </div>

        {/* Lista de Arquivos */}
        {hasFiles && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Arquivos Selecionados ({files.length})</h4>
              {hasCompletedFiles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                  disabled={isUploading}
                >
                  Limpar Concluídos
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((documentFile) => {
                const FileIcon = getFileIcon(documentFile.file.type);
                
                return (
                  <div
                    key={documentFile.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{documentFile.file.name}</p>
                        <Badge
                          variant={
                            documentFile.status === 'success' ? 'default' :
                            documentFile.status === 'error' ? 'destructive' :
                            documentFile.status === 'uploading' ? 'secondary' : 'outline'
                          }
                        >
                          {documentFile.status === 'pending' && 'Pendente'}
                          {documentFile.status === 'uploading' && 'Enviando'}
                          {documentFile.status === 'success' && 'Sucesso'}
                          {documentFile.status === 'error' && 'Erro'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(documentFile.file.size)}
                      </p>
                      
                      {documentFile.status === 'uploading' && (
                        <Progress value={documentFile.progress} className="mt-2" />
                      )}
                      
                      {documentFile.status === 'error' && documentFile.error && (
                        <p className="text-sm text-destructive mt-1">{documentFile.error}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {documentFile.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {documentFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      {documentFile.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      )}
                      
                      {(documentFile.status === 'pending' || documentFile.status === 'error') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(documentFile.id)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {pendingFiles.length > 0 && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={uploadFiles}
              disabled={isUploading || pendingFiles.length === 0}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar {pendingFiles.length} arquivo{pendingFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Limpar Tudo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}