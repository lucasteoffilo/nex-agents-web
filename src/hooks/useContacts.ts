import { useState, useEffect, useCallback } from 'react';
import { contactService, Contact, CreateContactDto, UpdateContactDto, ContactFilters } from '@/services/contact-service';
import { PaginationParams } from '@/types';

export interface UseContactsOptions {
  initialFilters?: ContactFilters;
  initialPagination?: PaginationParams;
  autoFetch?: boolean;
}

export interface UseContactsReturn {
  // Data
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  
  // Filters
  filters: ContactFilters;
  searchTerm: string;
  
  // Stats
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
    avgLeadScore: number;
    recentActivity: number;
    assigned: number;
    unassigned: number;
  } | null;
  
  // Actions
  fetchContacts: (params?: PaginationParams & ContactFilters) => Promise<void>;
  fetchContact: (contactId: string) => Promise<Contact | null>;
  createContact: (data: CreateContactDto) => Promise<Contact | null>;
  updateContact: (contactId: string, data: UpdateContactDto) => Promise<Contact | null>;
  deleteContact: (contactId: string) => Promise<boolean>;
  assignContact: (contactId: string, userId: string) => Promise<boolean>;
  unassignContact: (contactId: string) => Promise<boolean>;
  updateScore: (contactId: string, score: number) => Promise<boolean>;
  addTags: (contactId: string, tags: string[]) => Promise<boolean>;
  removeTags: (contactId: string, tags: string[]) => Promise<boolean>;
  addNote: (contactId: string, note: string) => Promise<boolean>;
  bulkUpdate: (contactIds: string[], data: Partial<UpdateContactDto>) => Promise<boolean>;
  bulkDelete: (contactIds: string[]) => Promise<boolean>;
  
  // Filter actions
  setFilters: (filters: ContactFilters) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Stats
  fetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useContacts(options: UseContactsOptions = {}): UseContactsReturn {
  const {
    initialFilters = {},
    initialPagination = { page: 1, limit: 10 },
    autoFetch = true
  } = options;

  // State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPagination.page);
  const [limit, setLimit] = useState(initialPagination.limit);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ContactFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<UseContactsReturn['stats']>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async (params?: PaginationParams & ContactFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.getContacts({
        page,
        limit,
        ...filters,
        ...params
      });

      if (response.success && response.data) {
        setContacts(response.data.contacts);
        setTotal(response.data.total);
        setPage(response.data.page);
        setLimit(response.data.limit);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.message || 'Erro ao carregar contatos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  // Fetch single contact
  const fetchContact = useCallback(async (contactId: string): Promise<Contact | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.getContact(contactId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.message || 'Erro ao carregar contato');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create contact
  const createContact = useCallback(async (data: CreateContactDto): Promise<Contact | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useContacts: Creating contact with data:', data);
      const response = await contactService.createContact(data);
      console.log('useContacts: API response:', response);
      
      if (response.success && response.data) {
        await fetchContacts(); // Refresh list
        return response.data;
      } else {
        setError(response.message || 'Erro ao criar contato');
        return null;
      }
    } catch (err) {
      console.error('useContacts: Error creating contact:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchContacts]);

  // Update contact
  const updateContact = useCallback(async (contactId: string, data: UpdateContactDto): Promise<Contact | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.updateContact(contactId, data);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return response.data;
      } else {
        setError(response.message || 'Erro ao atualizar contato');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete contact
  const deleteContact = useCallback(async (contactId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.deleteContact(contactId);
      
      if (response.success) {
        // Remove from local state
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        setTotal(prev => prev - 1);
        return true;
      } else {
        setError(response.message || 'Erro ao deletar contato');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign contact
  const assignContact = useCallback(async (contactId: string, userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.assignContact(contactId, userId);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao atribuir contato');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Unassign contact
  const unassignContact = useCallback(async (contactId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.unassignContact(contactId);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao desatribuir contato');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update score
  const updateScore = useCallback(async (contactId: string, score: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.updateContactScore(contactId, score);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao atualizar score');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add tags
  const addTags = useCallback(async (contactId: string, tags: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.addTags(contactId, tags);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao adicionar tags');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove tags
  const removeTags = useCallback(async (contactId: string, tags: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.removeTags(contactId, tags);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao remover tags');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add note
  const addNote = useCallback(async (contactId: string, note: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.addNote(contactId, note);
      
      if (response.success && response.data) {
        // Update local state
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? response.data! : contact
        ));
        return true;
      } else {
        setError(response.message || 'Erro ao adicionar nota');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk update
  const bulkUpdate = useCallback(async (contactIds: string[], data: Partial<UpdateContactDto>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.bulkUpdateContacts(contactIds, data);
      
      if (response.success) {
        await fetchContacts(); // Refresh list
        return true;
      } else {
        setError(response.message || 'Erro ao atualizar contatos');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchContacts]);

  // Bulk delete
  const bulkDelete = useCallback(async (contactIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contactService.bulkDeleteContacts(contactIds);
      
      if (response.success) {
        await fetchContacts(); // Refresh list
        return true;
      } else {
        setError(response.message || 'Erro ao deletar contatos');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchContacts]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      
      const response = await contactService.getContactStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchContacts();
    await fetchStats();
  }, [fetchContacts, fetchStats]);

  // Pagination helpers
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  // Auto fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchContacts();
    }
  }, [fetchContacts, autoFetch]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    contacts,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    
    // Filters
    filters,
    searchTerm,
    
    // Stats
    stats,
    
    // Actions
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    assignContact,
    unassignContact,
    updateScore,
    addTags,
    removeTags,
    addNote,
    bulkUpdate,
    bulkDelete,
    
    // Filter actions
    setFilters,
    setSearchTerm,
    clearFilters,
    
    // Pagination
    setPage,
    setLimit,
    nextPage,
    prevPage,
    
    // Stats
    fetchStats,
    refresh
  };
}
