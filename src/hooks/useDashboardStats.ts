import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalGalleries: number;
  totalPhotos: number;
  totalReviewers: number;
  totalSelections: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get owned gallery IDs
      const { data: ownedGalleries } = await supabase
        .from('galleries')
        .select('id')
        .eq('owner_id', user.id);

      const galleryIds = ownedGalleries?.map(g => g.id) || [];

      // Fetch counts in parallel
      const [galleriesRes, photosRes, reviewersRes, selectionsRes] = await Promise.all([
        // Total galleries owned by this user
        supabase
          .from('galleries')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user.id),
        
        // Total photos in owned galleries
        galleryIds.length > 0
          ? supabase
              .from('photos')
              .select('id', { count: 'exact', head: true })
              .in('gallery_id', galleryIds)
          : Promise.resolve({ count: 0, error: null }),
        
        // Total reviewers
        supabase
          .from('user_roles')
          .select('user_id', { count: 'exact', head: true })
          .eq('role', 'reviewer'),
        
        // Total selections on photos in owned galleries
        galleryIds.length > 0
          ? (async () => {
              const { data: photos } = await supabase
                .from('photos')
                .select('id')
                .in('gallery_id', galleryIds);
              
              const photoIds = photos?.map(p => p.id) || [];
              
              if (photoIds.length === 0) return { count: 0, error: null };
              
              return supabase
                .from('photo_selections')
                .select('id', { count: 'exact', head: true })
                .in('photo_id', photoIds);
            })()
          : Promise.resolve({ count: 0, error: null }),
      ]);

      if (galleriesRes.error) throw galleriesRes.error;
      if (photosRes.error) throw photosRes.error;
      if (reviewersRes.error) throw reviewersRes.error;
      if (selectionsRes.error) throw selectionsRes.error;

      return {
        totalGalleries: galleriesRes.count || 0,
        totalPhotos: photosRes.count || 0,
        totalReviewers: reviewersRes.count || 0,
        totalSelections: selectionsRes.count || 0,
      } as DashboardStats;
    },
  });
};
