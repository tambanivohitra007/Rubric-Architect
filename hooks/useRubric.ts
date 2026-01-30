import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  createRubric,
  updateRubric,
  deleteRubric,
  getRubricsByUserId,
  enableSharing,
  disableSharing,
} from '../services/firestoreService';
import { RubricData } from '../types';

export function useRubric() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveRubric = useCallback(
    async (rubricData: RubricData): Promise<string | null> => {
      if (!user) {
        setError('You must be signed in to save rubrics');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        if (rubricData.id) {
          // Update existing rubric
          await updateRubric(rubricData.id, rubricData);
          return rubricData.id;
        } else {
          // Create new rubric
          const newId = await createRubric(rubricData, user.uid);
          return newId;
        }
      } catch (err) {
        console.error('Error saving rubric:', err);
        setError('Failed to save rubric');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeRubric = useCallback(
    async (rubricId: string): Promise<boolean> => {
      if (!user) {
        setError('You must be signed in to delete rubrics');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        await deleteRubric(rubricId);
        return true;
      } catch (err) {
        console.error('Error deleting rubric:', err);
        setError('Failed to delete rubric');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const fetchUserRubrics = useCallback(async (): Promise<RubricData[]> => {
    if (!user) {
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const rubrics = await getRubricsByUserId(user.uid);
      return rubrics;
    } catch (err) {
      console.error('Error fetching rubrics:', err);
      setError('Failed to load rubrics');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleSharing = useCallback(
    async (rubricId: string, enable: boolean): Promise<string | null> => {
      if (!user) {
        setError('You must be signed in to manage sharing');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        if (enable) {
          const shareId = await enableSharing(rubricId);
          return shareId;
        } else {
          await disableSharing(rubricId);
          return null;
        }
      } catch (err) {
        console.error('Error toggling sharing:', err);
        setError('Failed to update sharing settings');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    saveRubric,
    removeRubric,
    fetchUserRubrics,
    toggleSharing,
    loading,
    error,
    clearError: () => setError(null),
  };
}
