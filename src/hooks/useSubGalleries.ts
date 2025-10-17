import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/lib/gallery-types';

export const useSubGalleries = (parentGalleryId: string | undefined) => {
  return useQuery({
    queryKey: ['sub-galleries', parentGalleryId],
    queryFn: async () => {
      if (!parentGalleryId) throw new Error('Parent gallery ID is required');

      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('parent_gallery_id', parentGalleryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch photo counts for each sub-gallery
      const galleriesWithCounts = await Promise.all(
        data.map(async (gallery) => {
          const { count } = await supabase
            .from('photos')
            .select('id', { count: 'exact', head: true })
            .eq('gallery_id', gallery.id);

          return {
            ...gallery,
            photo_count: count || 0,
          };
        })
      );

      return galleriesWithCounts;
    },
    enabled: !!parentGalleryId,
  });
};
