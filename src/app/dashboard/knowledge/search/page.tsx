'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Calendar,
  Tag,
  FileText,
  User,
  Clock,
  Star,
  Download,
  Eye,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface SearchFilters {
  query: string;
  categoryId?: string;
  tags: string[];
  language?: string;
  authorId?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  fileType?: string;
  status?: string;
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating';
  includeContent: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  content?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: string[];
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  rating: number;
  relevanceScore: number;
  highlights?: {
    title?: string[];
    content?: string[];
  };
}

interface SearchSuggestion {
  term: string;
  count: number;
  type: 'recent' | 'popular' | 'related';
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Manual de Integração da API',
    description: 'Guia completo para integração com nossa API REST',
    author: {
      id: '1',
      name: 'João Silva'
    },
    category: {
      id: '1',
      name: 'Documentação Técnica',
      color: 'blue'
    },
    tags: ['api', 'integração', 'desenvolvimento'],
    fileType: 'pdf',
    fileSize: 2048576,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:15:00Z',
    viewCount: 245,
    rating: 4.8,
    relevanceScore: 0.95,
    highlights: {
      title: ['Manual de <mark>Integração</mark> da API'],
      content: ['Este guia aborda todos os aspectos da <mark>integração</mark> com nossa API...']
    }
  },
  {
    id: '2',
    title: 'FAQ - Perguntas Frequentes sobre Atendimento',
    description: 'Respostas para as dúvidas mais comuns dos clientes',
    author: {
      id: '2',
      name: 'Maria Santos'
    },
    category: {
      id: '2',
      name: 'Atendimento',
      color: 'green'
    },
    tags: ['faq', 'atendimento', 'suporte'],
    fileType: 'docx',
    fileSize: 1024000,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:30:00Z',
    viewCount: 189,
    rating: 4.6,
    relevanceScore: 0.87
  }
];

const mockSuggestions: SearchSuggestion[] = [
  { term: 'integração api', count: 45, type: 'popular' },
  { term: 'configuração webhook', count: 32, type: 'recent' },
  { term: 'autenticação oauth', count: 28, type: 'related' },
  { term: 'documentação técnica', count: 67, type: 'popular' }
];

const categories = [
  { id: 'all', name: 'Todas as categorias' },
  { id: '1', name: 'Documentação Técnica' },
  { id: '2', name: 'Atendimento' },
  { id: '3', name: 'Vendas' },
  { id: '4', name: 'Jurídico' },
  { id: '5', name: 'RH' }
];

const languages = [
  { id: 'all', name: 'Todos os idiomas' },
  { id: 'pt', name: 'Português' },
  { id: 'en', name: 'Inglês' },
  { id: 'es', name: 'Espanhol' }
];

const fileTypes = [
  { id: 'all', name: 'Todos os tipos' },
  { id: 'pdf', name: 'PDF' },
  { id: 'docx', name: 'Word' },
  { id: 'pptx', name: 'PowerPoint' },
  { id: 'xlsx', name: 'Excel' },
  { id: 'txt', name: 'Texto' }
];

export default function KnowledgeSearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    sortBy: 'relevance',
    includeContent: false
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>(mockSuggestions);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!filters.query.trim()) return;
    
    setIsSearching(true);
    
    // Simular busca
    setTimeout(() => {
      setResults(mockSearchResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      handleFilterChange('tags', newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      tags: [],
      sortBy: 'relevance',
      includeContent: false
    });
    setSelectedTags([]);
  };

  useEffect(() => {
    if (filters.query) {
      const debounceTimer = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [filters.query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Busca Avançada</h1>
          <p className="text-muted-foreground">
            Encontre documentos usando busca semântica e filtros avançados
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Digite sua busca... (ex: como integrar webhook)"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 pr-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => handleFilterChange('query', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !filters.query.trim()}>
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Buscando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Buscar
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Search Suggestions */}
        {!filters.query && suggestions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sugestões de Busca</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('query', suggestion.term)}
                    className="text-xs"
                  >
                    {suggestion.type === 'popular' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {suggestion.type === 'recent' && <Clock className="h-3 w-3 mr-1" />}
                    {suggestion.type === 'related' && <BarChart3 className="h-3 w-3 mr-1" />}
                    {suggestion.term}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {suggestion.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros Avançados</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={filters.categoryId || 'all'}
                  onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? undefined : value)}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select
                  value={filters.language || 'all'}
                  onValueChange={(value) => handleFilterChange('language', value === 'all' ? undefined : value)}
                >
                  {languages.map(language => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* File Type Filter */}
              <div className="space-y-2">
                <Label>Tipo de Arquivo</Label>
                <Select
                  value={filters.fileType || 'all'}
                  onValueChange={(value) => handleFilterChange('fileType', value === 'all' ? undefined : value)}
                >
                  {fileTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange('sortBy', value as any)}
                >
                  <option value="relevance">Relevância</option>
                  <option value="date">Data</option>
                  <option value="popularity">Popularidade</option>
                  <option value="rating">Avaliação</option>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value
                  })}
                />
                <Input
                  type="date"
                  placeholder="Data final"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => handleFilterChange('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-3 w-3 p-0"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
                <Input
                  placeholder="Adicionar tag..."
                  className="w-32"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        addTag(target.value.trim());
                        target.value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </h2>
            <div className="text-sm text-muted-foreground">
              Busca por: "{filters.query}"
            </div>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 
                            className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                            dangerouslySetInnerHTML={{ 
                              __html: result.highlights?.title?.[0] || result.title 
                            }}
                          />
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: result.category.color }}
                          >
                            {result.category.name}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {result.description}
                        </p>
                        {result.highlights?.content && (
                          <div 
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{ 
                              __html: result.highlights.content[0] 
                            }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {result.rating}
                          </div>
                          <div>Relevância: {Math.round(result.relevanceScore * 100)}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {result.author.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(result.updatedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {result.fileType.toUpperCase()} • {formatBytes(result.fileSize)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {result.viewCount} visualizações
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs cursor-pointer"
                               onClick={() => addTag(tag)}>
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="default">
                        <Eye className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filters.query && results.length === 0 && !isSearching && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar sua busca ou usar filtros diferentes
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Dicas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use palavras-chave mais específicas</li>
                <li>Verifique a ortografia</li>
                <li>Tente sinônimos ou termos relacionados</li>
                <li>Use filtros para refinar a busca</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}