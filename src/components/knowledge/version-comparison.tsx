'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Equal,
  FileText,
  Clock,
  User,
  Download,
  Eye,
  RotateCcw
} from 'lucide-react';
import { formatDistanceToNow, formatBytes } from '@/lib/utils';

interface Version {
  id: string;
  version: number;
  title: string;
  description: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  changes: string[];
  size: number;
  contentHash: string;
}

interface VersionComparisonProps {
  versions: Version[];
  currentVersionId: string;
  onClose: () => void;
  onRestoreVersion?: (versionId: string) => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  oldContent?: string;
  newContent?: string;
}

interface ComparisonStats {
  linesAdded: number;
  linesRemoved: number;
  linesModified: number;
  charactersAdded: number;
  charactersRemoved: number;
  wordsAdded: number;
  wordsRemoved: number;
}

const generateDiff = (oldContent: string, newContent: string): { diff: DiffLine[], stats: ComparisonStats } => {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const diff: DiffLine[] = [];
  const stats: ComparisonStats = {
    linesAdded: 0,
    linesRemoved: 0,
    linesModified: 0,
    charactersAdded: 0,
    charactersRemoved: 0,
    wordsAdded: 0,
    wordsRemoved: 0
  };

  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldIndex >= oldLines.length) {
      // Linha adicionada
      diff.push({
        type: 'added',
        newLineNumber: newIndex + 1,
        content: newLine
      });
      stats.linesAdded++;
      stats.charactersAdded += newLine.length;
      stats.wordsAdded += newLine.split(/\s+/).filter(w => w.length > 0).length;
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Linha removida
      diff.push({
        type: 'removed',
        oldLineNumber: oldIndex + 1,
        content: oldLine
      });
      stats.linesRemoved++;
      stats.charactersRemoved += oldLine.length;
      stats.wordsRemoved += oldLine.split(/\s+/).filter(w => w.length > 0).length;
      oldIndex++;
    } else if (oldLine === newLine) {
      // Linha inalterada
      diff.push({
        type: 'unchanged',
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
        content: oldLine
      });
      oldIndex++;
      newIndex++;
    } else {
      // Linha modificada
      diff.push({
        type: 'modified',
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
        content: newLine,
        oldContent: oldLine,
        newContent: newLine
      });
      stats.linesModified++;
      stats.charactersRemoved += oldLine.length;
      stats.charactersAdded += newLine.length;
      stats.wordsRemoved += oldLine.split(/\s+/).filter(w => w.length > 0).length;
      stats.wordsAdded += newLine.split(/\s+/).filter(w => w.length > 0).length;
      oldIndex++;
      newIndex++;
    }
  }

  return { diff, stats };
};

export function VersionComparison({ versions, currentVersionId, onClose, onRestoreVersion }: VersionComparisonProps) {
  const [selectedVersionA, setSelectedVersionA] = useState<string>(currentVersionId);
  const [selectedVersionB, setSelectedVersionB] = useState<string>(
    versions.find(v => v.id !== currentVersionId)?.id || ''
  );
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const versionA = versions.find(v => v.id === selectedVersionA);
  const versionB = versions.find(v => v.id === selectedVersionB);

  const { diff, stats } = versionA && versionB ? generateDiff(versionA.content, versionB.content) : { diff: [], stats: {
    linesAdded: 0,
    linesRemoved: 0,
    linesModified: 0,
    charactersAdded: 0,
    charactersRemoved: 0,
    wordsAdded: 0,
    wordsRemoved: 0
  }};

  const getDiffLineClass = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-900';
      default:
        return 'bg-gray-50';
    }
  };

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="h-3 w-3 text-green-600" />;
      case 'removed':
        return <Minus className="h-3 w-3 text-red-600" />;
      case 'modified':
        return <Equal className="h-3 w-3 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Comparar Versões</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('side-by-side')}
          >
            Lado a Lado
          </Button>
          <Button
            variant={viewMode === 'unified' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('unified')}
          >
            Unificado
          </Button>
        </div>
      </div>

      {/* Version Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Versão A (Base)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedVersionA} onValueChange={setSelectedVersionA}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma versão" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    v{version.version} - {version.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {versionA && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{versionA.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(versionA.createdAt))} atrás</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>{formatBytes(versionA.size)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Versão B (Comparação)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedVersionB} onValueChange={setSelectedVersionB}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma versão" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    v{version.version} - {version.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {versionB && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{versionB.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(versionB.createdAt))} atrás</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>{formatBytes(versionB.size)}</span>
                </div>
              </div>
            )}
            
            {versionB && onRestoreVersion && versionB.id !== currentVersionId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRestoreVersion(versionB.id)}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar esta versão
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Stats */}
      {versionA && versionB && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas da Comparação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{stats.linesAdded}</div>
                <div className="text-sm text-muted-foreground">Linhas adicionadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">-{stats.linesRemoved}</div>
                <div className="text-sm text-muted-foreground">Linhas removidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.linesModified}</div>
                <div className="text-sm text-muted-foreground">Linhas modificadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{stats.charactersAdded}</div>
                <div className="text-sm text-muted-foreground">Caracteres adicionados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">-{stats.charactersRemoved}</div>
                <div className="text-sm text-muted-foreground">Caracteres removidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+{stats.wordsAdded}</div>
                <div className="text-sm text-muted-foreground">Palavras adicionadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">-{stats.wordsRemoved}</div>
                <div className="text-sm text-muted-foreground">Palavras removidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff View */}
      {versionA && versionB && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diferenças de Conteúdo</CardTitle>
            <CardDescription>
              Comparação entre v{versionA.version} e v{versionB.version}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto border rounded-lg">
              {diff.map((line, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 px-3 py-1 ${getDiffLineClass(line.type)}`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    {getDiffIcon(line.type)}
                    <span className="text-xs text-muted-foreground min-w-[3rem]">
                      {line.oldLineNumber && line.newLineNumber
                        ? `${line.oldLineNumber}:${line.newLineNumber}`
                        : line.oldLineNumber
                        ? `${line.oldLineNumber}:-`
                        : `-:${line.newLineNumber}`}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {line.type === 'modified' && line.oldContent && line.newContent ? (
                      <div className="space-y-1">
                        <div className="text-red-700 line-through">{line.oldContent}</div>
                        <div className="text-green-700">{line.newContent}</div>
                      </div>
                    ) : (
                      <div className="break-all">{line.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}