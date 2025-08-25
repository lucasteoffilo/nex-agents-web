'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  category: string;
  downloadCount: number;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Manual do Usuário - Sistema CRM',
    description: 'Guia completo para utilização do sistema de CRM da empresa',
    type: 'PDF',
    size: 2048576,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
    author: 'João Silva',
    tags: ['manual', 'crm', 'usuário'],
    category: 'Manuais',
    downloadCount: 45
  },
  {
    id: '2',
    title: 'Política de Privacidade LGPD',
    description: 'Documento oficial sobre tratamento de dados pessoais',
    type: 'PDF',
    size: 1024000,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    author: 'Maria Santos',
    tags: ['lgpd', 'privacidade', 'política'],
    category: 'Jurídico',
    downloadCount: 78
  },
  {
    id: '3',
    title: 'Procedimentos de Atendimento',
    description: 'Guia de boas práticas para atendimento ao cliente',
    type: 'DOCX',
    size: 512000,
    createdAt: '2024-01-08T11:45:00Z',
    updatedAt: '2024-01-22T10:20:00Z',
    author: 'Pedro Costa',
    tags: ['atendimento', 'procedimentos', 'cliente'],
    category: 'Processos',
    downloadCount: 32
  },
  {
    id: '4',
    title: 'FAQ - Perguntas Frequentes',
    description: 'Respostas para as dúvidas mais comuns dos clientes',
    type: 'PDF',
    size: 768000,
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-25T09:10:00Z',
    author: 'Ana Oliveira',
    tags: ['faq', 'dúvidas', 'suporte'],
    category: 'Suporte',
    downloadCount: 156
  }
];

const categories = ['Todos', 'Manuais', 'Jurídico', 'Processos', 'Suporte'];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">
            Gerencie e organize todos os documentos da base de conhecimento
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <Badge variant="secondary">{document.type}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{document.title}</CardTitle>
              <CardDescription>{document.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Metadata */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{document.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Atualizado em {formatDate(document.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{formatBytes(document.size)}</span>
                    <span>{document.downloadCount} downloads</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou criar um novo documento.
          </p>
        </div>
      )}
    </div>
  );
}