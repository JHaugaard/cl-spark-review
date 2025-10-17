import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoSelectionWithDetails } from '@/lib/gallery-types';

export const useAllSelections = () => {
  return useQuery({
    queryKey: ['all-selections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('photo_selections')
        .select(`
          *,
          photos!photo_selections_photo_id_fkey(
            *,
            galleries!photos_gallery_id_fkey(
              id,
              name,
              owner_id
            )
          ),
          profiles!photo_selections_reviewer_id_fkey(
            full_name,
            email
          )
        `)
        .order('selected_at', { ascending: false });

      if (error) throw error;

      // Filter to only selections in galleries owned by current user
      const filteredData = data.filter((s: any) => 
        s.photos?.galleries?.owner_id === user.id
      );

      return filteredData as PhotoSelectionWithDetails[];
    },
  });
};
