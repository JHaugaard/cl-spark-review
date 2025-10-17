import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ReviewerStats {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  gallery_count: number;
  selection_count: number;
}

export const useReviewerManagement = () => {
  return useQuery({
    queryKey: ['reviewers-management'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get reviewer user IDs
      const { data: reviewerRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'reviewer');

      const reviewerIds = reviewerRoles?.map(r => r.user_id) || [];

      if (reviewerIds.length === 0) return [];

      // Get all reviewer profiles
      const { data: reviewers, error: reviewersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .in('id', reviewerIds)
        .order('created_at', { ascending: false });

      if (reviewersError) throw reviewersError;

      // Get owner's gallery IDs
      const { data: ownedGalleries } = await supabase
        .from('galleries')
        .select('id')
        .eq('owner_id', user.id);

      const galleryIds = ownedGalleries?.map(g => g.id) || [];

      // For each reviewer, get their stats
      const reviewersWithStats = await Promise.all(
        (reviewers || []).map(async (reviewer) => {
          // Get gallery count (only owner's galleries)
          const { count: galleryCount } = galleryIds.length > 0
            ? await supabase
                .from('gallery_access')
                .select('gallery_id', { count: 'exact', head: true })
                .eq('reviewer_id', reviewer.id)
                .in('gallery_id', galleryIds)
            : { count: 0 };

          // Get selection count (only in owner's galleries)
          let selectionCount = 0;
          if (galleryIds.length > 0) {
            const { data: photos } = await supabase
              .from('photos')
              .select('id')
              .in('gallery_id', galleryIds);

            const photoIds = photos?.map(p => p.id) || [];

            if (photoIds.length > 0) {
              const { count } = await supabase
                .from('photo_selections')
                .select('id', { count: 'exact', head: true })
                .eq('reviewer_id', reviewer.id)
                .in('photo_id', photoIds);
              selectionCount = count || 0;
            }
          }

          return {
            id: reviewer.id,
            email: reviewer.email,
            full_name: reviewer.full_name,
            created_at: reviewer.created_at,
            gallery_count: galleryCount || 0,
            selection_count: selectionCount,
          };
        })
      );

      return reviewersWithStats as ReviewerStats[];
    },
  });
};

export const useRemoveReviewer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewerId: string) => {
      // Delete user role (this prevents login)
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', reviewerId);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewers-management'] });
      queryClient.invalidateQueries({ queryKey: ['reviewers'] });
      toast.success('Reviewer removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove reviewer');
    },
  });
};
