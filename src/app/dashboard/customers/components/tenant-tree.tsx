'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronDown, 
  Building, 
  Eye,
  Users,
  FileText
} from 'lucide-react';
import { Tenant } from '@/types';

interface TenantTreeProps {
  tenants: Tenant[];
  onSelectTenant: (tenant: Tenant) => void;
  onViewTenant: (tenant: Tenant) => void;
  parentId?: string;
  level?: number;
}

interface TreeNode {
  tenant: Tenant;
  children: TreeNode[];
}

function buildTree(tenants: Tenant[], parentId?: string): TreeNode[] {
  return tenants
    .filter(tenant => tenant.parentTenantId === parentId)
    .map(tenant => ({
      tenant,
      children: buildTree(tenants, tenant.id)
    }));
}

function TenantTreeNode({ 
  node, 
  level = 0, 
  onSelectTenant, 
  onViewTenant 
}: { 
  node: TreeNode; 
  level: number; 
  onSelectTenant: (tenant: Tenant) => void; 
  onViewTenant: (tenant: Tenant) => void; 
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Expandir até 2 níveis por padrão
  
  const hasChildren = node.children.length > 0;
  
  return (
    <div>
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer ${
          level > 0 ? 'ml-6' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelectTenant(node.tenant)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-6" />}
        
        <Building className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.tenant.name}</span>
            
            <Badge 
              variant={node.tenant.plan === 'enterprise' ? 'default' : 'outline'}
              className={{
                'bg-green-100 text-green-800': node.tenant.plan === 'pro',
                'bg-purple-100 text-purple-800': node.tenant.plan === 'enterprise',
                'text-xs': true,
              }}
            >
              {node.tenant.plan}
            </Badge>
            
            <Badge 
              variant={node.tenant.isActive ? 'default' : 'secondary'}
              className={node.tenant.isActive ? 'bg-green-100 text-green-800 text-xs' : 'text-xs'}
            >
              {node.tenant.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <code className="bg-muted px-1 py-0.5 rounded">{node.tenant.slug}</code>
            
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{node.tenant.currentSubTenants}/{node.tenant.maxSubTenants}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>Nível {node.tenant.level}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onViewTenant(node.tenant);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {node.children.map((childNode) => (
            <TenantTreeNode
              key={childNode.tenant.id}
              node={childNode}
              level={level + 1}
              onSelectTenant={onSelectTenant}
              onViewTenant={onViewTenant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TenantTree({ 
  tenants, 
  onSelectTenant, 
  onViewTenant, 
  parentId, 
  level = 0 
}: TenantTreeProps) {
  const treeData = buildTree(tenants, parentId);
  
  if (treeData.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum cliente encontrado</h3>
        <p className="text-muted-foreground">
          Não há clientes disponíveis para visualização na hierarquia.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-1">
          {treeData.map((node) => (
            <TenantTreeNode
              key={node.tenant.id}
              node={node}
              level={level}
              onSelectTenant={onSelectTenant}
              onViewTenant={onViewTenant}
            />
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {tenants.length} clientes</span>
            <span>
              {tenants.filter(t => t.isActive).length} ativos • 
              {tenants.filter(t => !t.isActive).length} inativos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}