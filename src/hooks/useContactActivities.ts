import { useState, useEffect } from 'react';
import contactActivityService, { ContactActivity, CreateContactActivityDto, UpdateContactActivityDto, ActivityStats } from '@/services/contact-activity-service';

interface UseContactActivitiesProps {
  contactId?: string;
  filters?: {
    type?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

export const useContactActivities = ({ contactId, filters }: UseContactActivitiesProps = {}) => {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [activitiesData, statsData] = await Promise.all([
        contactActivityService.getContactActivities(contactId),
        contactActivityService.getActivityStats(contactId)
      ]);
      
      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: CreateContactActivityDto): Promise<ContactActivity | null> => {
    try {
      const newActivity = await contactActivityService.createActivity(activityData);
      setActivities(prev => [newActivity, ...prev]);
      
      // Atualizar stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          byType: {
            ...prev.byType,
            [newActivity.type]: (prev.byType[newActivity.type] || 0) + 1
          },
          recent: [newActivity, ...prev.recent.slice(0, 4)]
        } : null);
      }
      
      return newActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atividade');
      return null;
    }
  };

  const updateActivity = async (id: string, activityData: UpdateContactActivityDto): Promise<ContactActivity | null> => {
    try {
      const updatedActivity = await contactActivityService.updateActivity(id, activityData);
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ));
      
      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar atividade');
      return null;
    }
  };

  const deleteActivity = async (id: string): Promise<boolean> => {
    try {
      await contactActivityService.deleteActivity(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
      
      // Atualizar stats
      if (stats) {
        const deletedActivity = activities.find(a => a.id === id);
        if (deletedActivity) {
          setStats(prev => prev ? {
            ...prev,
            total: Math.max(0, prev.total - 1),
            byType: {
              ...prev.byType,
              [deletedActivity.type]: Math.max(0, (prev.byType[deletedActivity.type] || 1) - 1)
            },
            recent: prev.recent.filter(a => a.id !== id)
          } : null);
        }
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar atividade');
      return false;
    }
  };

  const refresh = () => {
    fetchActivities();
  };

  useEffect(() => {
    fetchActivities();
  }, [contactId, filters]);

  return {
    activities,
    stats,
    loading,
    error,
    createActivity,
    updateActivity,
    deleteActivity,
    refresh,
  };
};
