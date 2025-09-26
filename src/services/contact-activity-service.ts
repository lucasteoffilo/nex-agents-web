import apiService from './api';

export interface ContactActivity {
  id: string;
  title: string;
  description: string;
  type: string;
  activityDate: string;
  userId: string;
  contactId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactActivityDto {
  title: string;
  description: string;
  type: string;
  activityDate: string;
  userId: string;
  contactId: string;
  metadata?: Record<string, any>;
}

export interface UpdateContactActivityDto {
  title?: string;
  description?: string;
  type?: string;
  activityDate?: string;
  userId?: string;
  contactId?: string;
  metadata?: Record<string, any>;
}

export interface ActivityStats {
  total: number;
  byType: Record<string, number>;
  recent: ContactActivity[];
}

export class ContactActivityService {
  async getActivities(contactId?: string, filters?: {
    type?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ContactActivity[]> {
    const params = new URLSearchParams();
    
    if (contactId) params.append('contactId', contactId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiService.get(`/contact-activities?${params.toString()}`);
    return response.data;
  }

  async getActivity(id: string): Promise<ContactActivity> {
    const response = await apiService.get(`/contact-activities/${id}`);
    return response.data;
  }

  async createActivity(activityData: CreateContactActivityDto): Promise<ContactActivity> {
    const response = await apiService.post('/contact-activities', activityData);
    return response.data;
  }

  async updateActivity(id: string, activityData: UpdateContactActivityDto): Promise<ContactActivity> {
    const response = await apiService.patch(`/contact-activities/${id}`, activityData);
    return response.data;
  }

  async deleteActivity(id: string): Promise<void> {
    await apiService.delete(`/contact-activities/${id}`);
  }

  async getContactActivities(contactId: string): Promise<ContactActivity[]> {
    const response = await apiService.get(`/contact-activities/contact/${contactId}`);
    return response.data;
  }

  async getActivityStats(contactId?: string): Promise<ActivityStats> {
    const params = contactId ? `?contactId=${contactId}` : '';
    const response = await apiService.get(`/contact-activities/stats${params}`);
    return response.data;
  }
}

export default new ContactActivityService();
