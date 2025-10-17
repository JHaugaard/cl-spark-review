import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reviewer, GalleryAccess } from '@/lib/gallery-types';
import { toast } from 'sonner';

export const useReviewers = () => {
  return useQuery({
    queryKey: ['reviewers'],
    queryFn: async () => {
      // First get reviewer user IDs
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'reviewer');

      if (rolesError) throw rolesError;
      
      const reviewerIds = roles.map(r => r.user_id);
      
      if (reviewerIds.length === 0) {
        return [] as Reviewer[];
      }

      // Then get profiles for those users
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', reviewerIds);

      if (error) throw error;
      return data as Reviewer[];
    },
  });
};

export const useGalleryAccess = (galleryId: string | undefined) => {
  return useQuery({
    queryKey: ['gallery-access', galleryId],
    queryFn: async () => {
      if (!galleryId) throw new Error('Gallery ID is required');

      const { data, error } = await supabase
        .from('gallery_access')
        .select('*')
        .eq('gallery_id', galleryId);

      if (error) throw error;
      return data as GalleryAccess[];
    },
    enabled: !!galleryId,
  });
};

export const useToggleGalleryAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      galleryId,
      reviewerId,
      grant,
    }: {
      galleryId: string;
      reviewerId: string;
      grant: boolean;
    }) => {
      if (grant) {
        // Grant access
        const { error } = await supabase
          .from('gallery_access')
          .insert({
            gallery_id: galleryId,
            reviewer_id: reviewerId,
          });

        if (error) throw error;
      } else {
        // Revoke access
        const { error } = await supabase
          .from('gallery_access')
          .delete()
          .eq('gallery_id', galleryId)
          .eq('reviewer_id', reviewerId);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gallery-access', variables.galleryId] });
      toast.success(variables.grant ? 'Access granted' : 'Access revoked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update access');
    },
  });
};
