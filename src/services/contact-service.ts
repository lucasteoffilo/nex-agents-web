import apiService from './api';
import { ApiResponse, PaginationParams } from '../types';

export interface Contact {
  id: string;
  tenantId: string;
  assignedToId?: string;
  type: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor' | 'other';
  status: 'active' | 'inactive' | 'blocked' | 'archived';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  leadSource?: string;
  leadScore?: number;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  metadata?: {
    campaign?: string;
    leadSource?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    customData?: Record<string, any>;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
}

export interface CreateContactDto {
  type?: 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor' | 'other';
  status?: 'active' | 'inactive' | 'blocked' | 'archived';
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  leadSource?: string;
  leadScore?: number;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, any>;
  metadata?: {
    campaign?: string;
    leadSource?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    customData?: Record<string, any>;
  };
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  assignedToId?: string;
}

export interface ContactFilters {
  type?: string;
  status?: string;
  leadSource?: string;
  assignedToId?: string;
  tags?: string[];
  scoreMin?: number;
  scoreMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  lastContactAfter?: string;
  lastContactBefore?: string;
}

class ContactService {
  // Listar contatos com paginação e filtros
  async getContacts(params?: PaginationParams & ContactFilters): Promise<ApiResponse<{
    contacts: Contact[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>> {
    return apiService.get('/contacts', params);
  }

  // Buscar contato por ID
  async getContact(contactId: string): Promise<ApiResponse<Contact>> {
    return apiService.get(`/contacts/${contactId}`);
  }

  // Criar novo contato
  async createContact(data: CreateContactDto): Promise<ApiResponse<Contact>> {
    return apiService.post('/contacts', data);
  }

  // Atualizar contato
  async updateContact(contactId: string, data: UpdateContactDto): Promise<ApiResponse<Contact>> {
    return apiService.put(`/contacts/${contactId}`, data);
  }

  // Deletar contato
  async deleteContact(contactId: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/contacts/${contactId}`);
  }

  // Atribuir contato a um usuário
  async assignContact(contactId: string, userId: string): Promise<ApiResponse<Contact>> {
    return apiService.put(`/contacts/${contactId}/assign`, { assignedToId: userId });
  }

  // Desatribuir contato
  async unassignContact(contactId: string): Promise<ApiResponse<Contact>> {
    return apiService.put(`/contacts/${contactId}/assign`, { assignedToId: null });
  }

  // Atualizar score do contato
  async updateContactScore(contactId: string, score: number): Promise<ApiResponse<Contact>> {
    return apiService.put(`/contacts/${contactId}/score`, { score });
  }

  // Adicionar tags ao contato
  async addTags(contactId: string, tags: string[]): Promise<ApiResponse<Contact>> {
    return apiService.post(`/contacts/${contactId}/tags`, { tags });
  }

  // Remover tags do contato
  async removeTags(contactId: string, tags: string[]): Promise<ApiResponse<Contact>> {
    return apiService.delete(`/contacts/${contactId}/tags`, { tags });
  }

  // Adicionar nota ao contato
  async addNote(contactId: string, note: string): Promise<ApiResponse<Contact>> {
    return apiService.post(`/contacts/${contactId}/notes`, { note });
  }

  // Atualizar última interação
  async updateLastContact(contactId: string): Promise<ApiResponse<Contact>> {
    return apiService.put(`/contacts/${contactId}/last-contact`);
  }

  // Buscar contatos por email
  async getContactByEmail(email: string): Promise<ApiResponse<Contact>> {
    return apiService.get(`/contacts/email/${email}`);
  }

  // Buscar contatos por telefone
  async getContactByPhone(phone: string): Promise<ApiResponse<Contact>> {
    return apiService.get(`/contacts/phone/${phone}`);
  }

  // Exportar contatos
  async exportContacts(format: 'csv' | 'xlsx' = 'csv', filters?: ContactFilters): Promise<Blob> {
    const response = await apiService.get(`/contacts/export?format=${format}`, filters, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Importar contatos
  async importContacts(file: File): Promise<ApiResponse<{
    imported: number;
    errors: Array<{
      row: number;
      error: string;
      data: any;
    }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Estatísticas de contatos
  async getContactStats(): Promise<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    avgLeadScore: number;
    recentActivity: number;
    assigned: number;
    unassigned: number;
  }>> {
    return apiService.get('/contacts/stats');
  }

  // Buscar contatos similares
  async getSimilarContacts(contactId: string, limit: number = 5): Promise<ApiResponse<Contact[]>> {
    return apiService.get(`/contacts/${contactId}/similar`, { limit });
  }

  // Mesclar contatos duplicados
  async mergeContacts(primaryContactId: string, duplicateContactIds: string[]): Promise<ApiResponse<Contact>> {
    return apiService.post(`/contacts/${primaryContactId}/merge`, { duplicateContactIds });
  }

  // Buscar contatos por tags
  async getContactsByTags(tags: string[]): Promise<ApiResponse<Contact[]>> {
    return apiService.get('/contacts/by-tags', { tags });
  }

  // Atualizar múltiplos contatos
  async bulkUpdateContacts(contactIds: string[], data: Partial<UpdateContactDto>): Promise<ApiResponse<{
    updated: number;
    errors: Array<{
      contactId: string;
      error: string;
    }>;
  }>> {
    return apiService.put('/contacts/bulk-update', { contactIds, data });
  }

  // Deletar múltiplos contatos
  async bulkDeleteContacts(contactIds: string[]): Promise<ApiResponse<{
    deleted: number;
    errors: Array<{
      contactId: string;
      error: string;
    }>;
  }>> {
    return apiService.delete('/contacts/bulk-delete', { contactIds });
  }
}

export const contactService = new ContactService();
