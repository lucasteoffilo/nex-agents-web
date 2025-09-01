import { ApiResponse, PaginationParams, Tenant, TenantHierarchy, TenantInvitation, TenantUsage, MultiTenantQuery } from '@/types';
import apiService from './api';

class TenantService {
  // Operações básicas de CRUD para tenants
  async getTenants(params?: PaginationParams & MultiTenantQuery): Promise<ApiResponse<Tenant[]>> {
    return apiService.get('/tenants', params);
  }

  async getTenant(tenantId: string): Promise<ApiResponse<Tenant>> {
    return apiService.get(`/tenants/${tenantId}`);
  }

  async createTenant(data: {
    name: string;
    slug: string;
    parentTenantId?: string;
    plan: 'free' | 'pro' | 'enterprise';
    settings?: any;
    metadata?: any;
  }): Promise<ApiResponse<Tenant>> {
    return apiService.post('/tenants', data);
  }

  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<ApiResponse<Tenant>> {
    return apiService.put(`/tenants/${tenantId}`, data);
  }

  async deleteTenant(tenantId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/tenants/${tenantId}`);
  }

  // Operações específicas de hierarquia
  async getTenantHierarchy(tenantId?: string, maxDepth?: number): Promise<ApiResponse<TenantHierarchy>> {
    const params = { maxDepth };
    const endpoint = tenantId ? `/tenants/${tenantId}/hierarchy` : '/tenants/hierarchy';
    return apiService.get(endpoint, params);
  }

  async getSubTenants(parentTenantId: string, params?: PaginationParams): Promise<ApiResponse<Tenant[]>> {
    return apiService.get(`/tenants/${parentTenantId}/sub-tenants`, params);
  }

  async moveTenant(tenantId: string, newParentId: string): Promise<ApiResponse<Tenant>> {
    return apiService.patch(`/tenants/${tenantId}/move`, { newParentId });
  }

  async getTenantPath(tenantId: string): Promise<ApiResponse<Tenant[]>> {
    return apiService.get(`/tenants/${tenantId}/path`);
  }

  // Gerenciamento de usuários e convites
  async inviteUser(tenantId: string, data: {
    email: string;
    roleId: string;
    message?: string;
  }): Promise<ApiResponse<TenantInvitation>> {
    return apiService.post(`/tenants/${tenantId}/invitations`, data);
  }

  async getInvitations(tenantId: string, params?: PaginationParams): Promise<ApiResponse<TenantInvitation[]>> {
    return apiService.get(`/tenants/${tenantId}/invitations`, params);
  }

  async acceptInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return apiService.post(`/invitations/${invitationId}/accept`);
  }

  async rejectInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return apiService.post(`/invitations/${invitationId}/reject`);
  }

  async cancelInvitation(invitationId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/invitations/${invitationId}`);
  }

  // Gerenciamento de usuários do tenant
  async getTenantUsers(tenantId: string, params?: PaginationParams): Promise<ApiResponse<any[]>> {
    return apiService.get(`/tenants/${tenantId}/users`, params);
  }

  async addUserToTenant(tenantId: string, data: {
    userId: string;
    roleId: string;
  }): Promise<ApiResponse<void>> {
    return apiService.post(`/tenants/${tenantId}/users`, data);
  }

  async removeUserFromTenant(tenantId: string, userId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/tenants/${tenantId}/users/${userId}`);
  }

  async updateUserRole(tenantId: string, userId: string, roleId: string): Promise<ApiResponse<void>> {
    return apiService.patch(`/tenants/${tenantId}/users/${userId}/role`, { roleId });
  }

  // Configurações e limites
  async getTenantSettings(tenantId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/tenants/${tenantId}/settings`);
  }

  async updateTenantSettings(tenantId: string, settings: any): Promise<ApiResponse<any>> {
    return apiService.put(`/tenants/${tenantId}/settings`, settings);
  }

  async getTenantLimits(tenantId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/tenants/${tenantId}/limits`);
  }

  async updateTenantLimits(tenantId: string, limits: any): Promise<ApiResponse<any>> {
    return apiService.put(`/tenants/${tenantId}/limits`, limits);
  }

  // Métricas e uso
  async getTenantUsage(tenantId: string, params?: {
    startDate?: string;
    endDate?: string;
    includeSubTenants?: boolean;
  }): Promise<ApiResponse<TenantUsage>> {
    return apiService.get(`/tenants/${tenantId}/usage`, params);
  }

  async getTenantMetrics(tenantId: string, params?: {
    period: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.get(`/tenants/${tenantId}/metrics`, params);
  }

  // Operações de switch de tenant
  async switchTenant(tenantId: string): Promise<ApiResponse<{
    token: string;
    tenant: Tenant;
    permissions: string[];
  }>> {
    return apiService.post('/auth/switch-tenant', { tenantId });
  }

  async getAvailableTenants(): Promise<ApiResponse<Tenant[]>> {
    return apiService.get('/auth/available-tenants');
  }

  // Validações
  async validateTenantSlug(slug: string, excludeId?: string): Promise<ApiResponse<{ available: boolean }>> {
    const params = excludeId ? { excludeId } : {};
    return apiService.get(`/tenants/validate-slug/${slug}`, params);
  }

  async checkTenantLimits(tenantId: string, resource: string): Promise<ApiResponse<{
    canCreate: boolean;
    current: number;
    limit: number;
    remaining: number;
  }>> {
    return apiService.get(`/tenants/${tenantId}/check-limits/${resource}`);
  }

  // Backup e restore
  async exportTenantData(tenantId: string, options?: {
    includeSubTenants?: boolean;
    resources?: string[];
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiService.post(`/tenants/${tenantId}/export`, options);
  }

  async importTenantData(tenantId: string, file: File): Promise<ApiResponse<{ jobId: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.post(`/tenants/${tenantId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Auditoria
  async getTenantAuditLog(tenantId: string, params?: PaginationParams & {
    action?: string;
    resource?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiService.get(`/tenants/${tenantId}/audit-log`, params);
  }

  // Billing e planos
  async getTenantBilling(tenantId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/tenants/${tenantId}/billing`);
  }

  async updateTenantPlan(tenantId: string, plan: string): Promise<ApiResponse<any>> {
    return apiService.patch(`/tenants/${tenantId}/plan`, { plan });
  }

  async getTenantInvoices(tenantId: string, params?: PaginationParams): Promise<ApiResponse<any[]>> {
    return apiService.get(`/tenants/${tenantId}/invoices`, params);
  }

  // Configurações de branding
  async updateTenantBranding(tenantId: string, branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: File;
    favicon?: File;
  }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    
    if (branding.primaryColor) formData.append('primaryColor', branding.primaryColor);
    if (branding.secondaryColor) formData.append('secondaryColor', branding.secondaryColor);
    if (branding.logo) formData.append('logo', branding.logo);
    if (branding.favicon) formData.append('favicon', branding.favicon);
    
    return apiService.put(`/tenants/${tenantId}/branding`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

const tenantService = new TenantService();
export default tenantService;
export { TenantService };