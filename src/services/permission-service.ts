import { ApiResponse, PaginationParams, Permission, UserRole, PermissionCondition } from '@/types';
import apiService from './api';

class PermissionService {
  // Gerenciamento de Permissões
  async getPermissions(params?: PaginationParams & {
    resource?: string;
    scope?: string;
    tenantId?: string;
  }): Promise<ApiResponse<Permission[]>> {
    return apiService.get('/permissions', params);
  }

  async getPermission(permissionId: string): Promise<ApiResponse<Permission>> {
    return apiService.get(`/permissions/${permissionId}`);
  }

  async createPermission(data: {
    name: string;
    slug: string;
    resource: string;
    action: string;
    scope: 'own' | 'tenant' | 'subtenant' | 'all';
    conditions?: PermissionCondition[];
    description?: string;
  }): Promise<ApiResponse<Permission>> {
    return apiService.post('/permissions', data);
  }

  async updatePermission(permissionId: string, data: Partial<Permission>): Promise<ApiResponse<Permission>> {
    return apiService.put(`/permissions/${permissionId}`, data);
  }

  async deletePermission(permissionId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/permissions/${permissionId}`);
  }

  // Gerenciamento de Roles
  async getRoles(params?: PaginationParams & {
    level?: 'system' | 'tenant' | 'user';
    tenantId?: string;
    includeSystemRoles?: boolean;
  }): Promise<ApiResponse<UserRole[]>> {
    return apiService.get('/roles', params);
  }

  async getRole(roleId: string): Promise<ApiResponse<UserRole>> {
    return apiService.get(`/roles/${roleId}`);
  }

  async createRole(data: {
    name: string;
    slug: string;
    description?: string;
    level: 'system' | 'tenant' | 'user';
    permissionIds: string[];
    tenantId?: string;
  }): Promise<ApiResponse<UserRole>> {
    return apiService.post('/roles', data);
  }

  async updateRole(roleId: string, data: Partial<UserRole>): Promise<ApiResponse<UserRole>> {
    return apiService.put(`/roles/${roleId}`, data);
  }

  async deleteRole(roleId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/roles/${roleId}`);
  }

  // Associação de permissões a roles
  async addPermissionToRole(roleId: string, permissionId: string): Promise<ApiResponse<void>> {
    return apiService.post(`/roles/${roleId}/permissions`, { permissionId });
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/roles/${roleId}/permissions/${permissionId}`);
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<ApiResponse<void>> {
    return apiService.put(`/roles/${roleId}/permissions`, { permissionIds });
  }

  // Verificação de permissões
  async checkPermission(data: {
    userId?: string;
    resource: string;
    action: string;
    scope?: string;
    tenantId?: string;
    resourceId?: string;
  }): Promise<ApiResponse<{ hasPermission: boolean; reason?: string }>> {
    return apiService.post('/permissions/check', data);
  }

  async getUserPermissions(userId: string, tenantId?: string): Promise<ApiResponse<{
    permissions: Permission[];
    roles: UserRole[];
    inheritedPermissions: Permission[];
  }>> {
    const params = tenantId ? { tenantId } : {};
    return apiService.get(`/users/${userId}/permissions`, params);
  }

  async getTenantPermissions(tenantId: string): Promise<ApiResponse<Permission[]>> {
    return apiService.get(`/tenants/${tenantId}/permissions`);
  }

  // Herança de permissões
  async getInheritedPermissions(tenantId: string): Promise<ApiResponse<{
    direct: Permission[];
    inherited: Permission[];
    source: { [key: string]: string }; // permissionId -> sourceTenantId
  }>> {
    return apiService.get(`/tenants/${tenantId}/inherited-permissions`);
  }

  async updatePermissionInheritance(tenantId: string, data: {
    inheritFromParent: boolean;
    overridePermissions?: string[];
    additionalPermissions?: string[];
  }): Promise<ApiResponse<void>> {
    return apiService.put(`/tenants/${tenantId}/permission-inheritance`, data);
  }

  // Templates de permissões
  async getPermissionTemplates(): Promise<ApiResponse<{
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    targetRole: string;
  }[]>> {
    return apiService.get('/permission-templates');
  }

  async applyPermissionTemplate(templateId: string, targetId: string, targetType: 'role' | 'user' | 'tenant'): Promise<ApiResponse<void>> {
    return apiService.post(`/permission-templates/${templateId}/apply`, {
      targetId,
      targetType
    });
  }

  // Auditoria de permissões
  async getPermissionAuditLog(params?: PaginationParams & {
    userId?: string;
    tenantId?: string;
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    id: string;
    userId: string;
    tenantId: string;
    resource: string;
    action: string;
    allowed: boolean;
    reason: string;
    timestamp: Date;
    metadata: any;
  }[]>> {
    return apiService.get('/permissions/audit-log', params);
  }

  // Análise de permissões
  async analyzeUserAccess(userId: string, tenantId?: string): Promise<ApiResponse<{
    totalPermissions: number;
    directPermissions: number;
    inheritedPermissions: number;
    roles: UserRole[];
    accessMatrix: {
      resource: string;
      actions: {
        action: string;
        allowed: boolean;
        source: 'direct' | 'inherited' | 'role';
      }[];
    }[];
  }>> {
    const params = tenantId ? { tenantId } : {};
    return apiService.get(`/users/${userId}/access-analysis`, params);
  }

  async analyzeTenantAccess(tenantId: string): Promise<ApiResponse<{
    users: {
      userId: string;
      userName: string;
      roles: string[];
      permissionCount: number;
      lastAccess: Date;
    }[];
    roles: {
      roleId: string;
      roleName: string;
      userCount: number;
      permissionCount: number;
    }[];
    permissions: {
      permissionId: string;
      permissionName: string;
      userCount: number;
      roleCount: number;
    }[];
  }>> {
    return apiService.get(`/tenants/${tenantId}/access-analysis`);
  }

  // Bulk operations
  async bulkAssignPermissions(data: {
    userIds?: string[];
    roleIds?: string[];
    permissionIds: string[];
    tenantId?: string;
  }): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return apiService.post('/permissions/bulk-assign', data);
  }

  async bulkRevokePermissions(data: {
    userIds?: string[];
    roleIds?: string[];
    permissionIds: string[];
    tenantId?: string;
  }): Promise<ApiResponse<{ success: number; failed: number; errors: any[] }>> {
    return apiService.post('/permissions/bulk-revoke', data);
  }

  // Validações
  async validatePermissionSlug(slug: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { excludeId } : {};
    return apiService.get(`/permissions/validate-slug/${slug}`, params);
  }

  async validateRoleSlug(slug: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { excludeId } : {};
    return apiService.get(`/roles/validate-slug/${slug}`, params);
  }

  // Utilitários
  async getResourceActions(resource: string): Promise<ApiResponse<string[]>> {
    return apiService.get(`/permissions/resources/${resource}/actions`);
  }

  async getAvailableResources(): Promise<ApiResponse<{
    resource: string;
    description: string;
    actions: string[];
  }[]>> {
    return apiService.get('/permissions/resources');
  }

  async getPermissionMatrix(tenantId?: string): Promise<ApiResponse<{
    resources: string[];
    actions: string[];
    matrix: { [resource: string]: { [action: string]: boolean } };
  }>> {
    const params = tenantId ? { tenantId } : {};
    return apiService.get('/permissions/matrix', params);
  }
}

const permissionService = new PermissionService();
export default permissionService;
export { PermissionService };