import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoSelection } from '@/lib/gallery-types';
import { toast } from 'sonner';

// Fetch all selections for current user
export const usePhotoSelections = () => {
  return useQuery({
    queryKey: ['photo-selections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('photo_selections')
        .select('*, photos(*, galleries(name))')
        .eq('reviewer_id', user.id)
        .order('selected_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Fetch selections for specific gallery
export const useGallerySelections = (galleryId: string | undefined) => {
  return useQuery({
    queryKey: ['photo-selections', galleryId],
    queryFn: async () => {
      if (!galleryId) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get all photos in this gallery
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('id')
        .eq('gallery_id', galleryId);

      if (photosError) throw photosError;
      if (!photos || photos.length === 0) return [];

      const photoIds = photos.map(p => p.id);

      // Then get selections for these photos
      const { data, error } = await supabase
        .from('photo_selections')
        .select('*')
        .eq('reviewer_id', user.id)
        .in('photo_id', photoIds);

      if (error) throw error;
      return data as PhotoSelection[];
    },
    enabled: !!galleryId,
  });
};

// Toggle selection (add or remove)
export const useToggleSelection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, isSelected }: { photoId: string; isSelected: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isSelected) {
        // Remove selection
        const { error } = await supabase
          .from('photo_selections')
          .delete()
          .eq('photo_id', photoId)
          .eq('reviewer_id', user.id);
        
        if (error) throw error;
      } else {
        // Add selection
        const { error } = await supabase
          .from('photo_selections')
          .insert({
            photo_id: photoId,
            reviewer_id: user.id,
          });
        
        if (error) throw error;
      }

      return { photoId, isSelected: !isSelected };
    },
    onMutate: async ({ photoId, isSelected }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['photo-selections'] });
      
      const previousSelections = queryClient.getQueryData(['photo-selections']);
      
      queryClient.setQueryData(['photo-selections'], (old: any) => {
        if (!old) return old;
        
        if (isSelected) {
          return old.filter((s: PhotoSelection) => s.photo_id !== photoId);
        } else {
          return [...old, { photo_id: photoId, selected_at: new Date().toISOString() }];
        }
      });

      return { previousSelections };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSelections) {
        queryClient.setQueryData(['photo-selections'], context.previousSelections);
      }
      toast.error('Failed to update selection');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-selections'] });
    },
  });
};

// Update notes for selection
export const useUpdateSelectionNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, notes }: { photoId: string; notes: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('photo_selections')
        .update({ notes })
        .eq('photo_id', photoId)
        .eq('reviewer_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-selections'] });
    },
  });
};

// Clear all selections
export const useClearAllSelections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('photo_selections')
        .delete()
        .eq('reviewer_id', user.id);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['photo-selections'] });
      const previousSelections = queryClient.getQueryData(['photo-selections']);
      
      queryClient.setQueryData(['photo-selections'], []);
      
      return { previousSelections };
    },
    onError: (err, variables, context) => {
      if (context?.previousSelections) {
        queryClient.setQueryData(['photo-selections'], context.previousSelections);
      }
      toast.error('Failed to clear selections');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-selections'] });
      toast.success('All selections cleared');
    },
  });
};
