import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GuestStats {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  gallery_count: number;
  selection_count: number;
}

export const useGuestManagement = () => {
  return useQuery({
    queryKey: ['guests-management'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get reviewer user IDs (database still uses 'reviewer' role)
      const { data: guestRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'reviewer');

      const guestIds = guestRoles?.map(r => r.user_id) || [];

      if (guestIds.length === 0) return [];

      // Get all guest profiles
      const { data: guests, error: guestsError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `)
        .in('id', guestIds)
        .order('created_at', { ascending: false });

      if (guestsError) throw guestsError;

      // Get owner's gallery IDs
      const { data: ownedGalleries } = await supabase
        .from('galleries')
        .select('id')
        .eq('owner_id', user.id);

      const galleryIds = ownedGalleries?.map(g => g.id) || [];

      // For each guest, get their stats
      const guestsWithStats = await Promise.all(
        (guests || []).map(async (guest) => {
          // Get gallery count (only owner's galleries)
          const { count: galleryCount } = galleryIds.length > 0
            ? await supabase
                .from('gallery_access')
                .select('gallery_id', { count: 'exact', head: true })
                .eq('reviewer_id', guest.id)
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
                .eq('reviewer_id', guest.id)
                .in('photo_id', photoIds);
              selectionCount = count || 0;
            }
          }

          return {
            id: guest.id,
            email: guest.email,
            full_name: guest.full_name,
            created_at: guest.created_at,
            gallery_count: galleryCount || 0,
            selection_count: selectionCount,
          };
        })
      );

      return guestsWithStats as GuestStats[];
    },
  });
};

export const useRemoveGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: string) => {
      // Delete user role (this prevents login)
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', guestId);

      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests-management'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Guest removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove guest');
    },
  });
};
