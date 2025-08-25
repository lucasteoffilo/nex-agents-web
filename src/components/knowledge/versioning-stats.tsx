'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  GitBranch,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Activity,
  Crown,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useVersioningStats } from '@/hooks/use-document-versions';
import { formatDistanceToNow } from '@/lib/utils';

interface VersioningStatsProps {
  className?: string;
}

export function VersioningStats({ className }: VersioningStatsProps) {
  const { stats, isLoading, error, refetch } = useVersioningStats();

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Estatísticas de Versionamento</h2>
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Carregando...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Estatísticas de Versionamento</h2>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Erro ao carregar estatísticas: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold tracking-tight">Estatísticas de Versionamento</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Nenhuma estatística disponível.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Estatísticas de Versionamento</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Documentos</p>
                <p className="text-2xl font-bold">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Documentos com versionamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Versões</p>
                <p className="text-2xl font-bold">{stats.totalVersions}</p>
              </div>
              <GitBranch className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Versões criadas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média por Documento</p>
                <p className="text-2xl font-bold">{stats.averageVersionsPerDocument.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Versões por documento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mais Versionado</p>
                <p className="text-2xl font-bold">{stats.mostVersionedDocument.versionCount}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {stats.mostVersionedDocument.title}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade de Versionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Versões criadas nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.versioningActivity.slice(0, 7).map((activity, index) => {
                const date = new Date(activity.date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {isToday ? 'Hoje' : formatDistanceToNow(date)} 
                      </span>
                      {isToday && <Badge variant="secondary" className="text-xs">Hoje</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{activity.count}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.count === 1 ? 'versão' : 'versões'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {stats.versioningActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Autores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Principais Autores
            </CardTitle>
            <CardDescription>
              Usuários que mais criam versões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topAuthors.slice(0, 5).map((author, index) => {
                const isTopAuthor = index === 0;
                
                return (
                  <div key={author.authorId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTopAuthor && <Crown className="h-4 w-4 text-yellow-500" />}
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {author.authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{author.authorName}</p>
                        {isTopAuthor && (
                          <Badge variant="secondary" className="text-xs">
                            Top Autor
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{author.versionCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {author.versionCount === 1 ? 'versão' : 'versões'}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {stats.topAuthors.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum autor encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {((stats.totalVersions / stats.totalDocuments) * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">
                Taxa de versionamento
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.versioningActivity.reduce((acc, curr) => acc + curr.count, 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                Versões este mês
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.topAuthors.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Autores ativos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}