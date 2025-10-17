import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PhotoAnalytics {
  photo_id: string;
  filename: string;
  thumbnail_url: string;
  gallery_name: string;
  selection_count: number;
}

export interface GalleryAnalytics {
  gallery_id: string;
  gallery_name: string;
  total_photos: number;
  selected_photos: number;
  selection_rate: number;
  most_selected?: PhotoAnalytics[];
  least_selected?: PhotoAnalytics[];
}

export const useGalleryAnalytics = (galleryId?: string) => {
  return useQuery({
    queryKey: ['gallery-analytics', galleryId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If specific gallery, fetch its analytics
      if (galleryId) {
        const { data: photos, error } = await supabase
          .from('photos')
          .select(`
            id,
            filename,
            thumbnail_url,
            galleries!photos_gallery_id_fkey(name)
          `)
          .eq('gallery_id', galleryId);

        if (error) throw error;

        // Get selection counts for each photo
        const photosWithCounts = await Promise.all(
          (photos || []).map(async (photo: any) => {
            const { count } = await supabase
              .from('photo_selections')
              .select('id', { count: 'exact', head: true })
              .eq('photo_id', photo.id);

            return {
              photo_id: photo.id,
              filename: photo.filename,
              thumbnail_url: photo.thumbnail_url,
              gallery_name: photo.galleries?.name || '',
              selection_count: count || 0,
            };
          })
        );

        // Sort by selection count
        const sorted = photosWithCounts.sort((a, b) => b.selection_count - a.selection_count);

        const totalPhotos = photos.length;
        const selectedPhotos = photosWithCounts.filter(p => p.selection_count > 0).length;

        return {
          gallery_id: galleryId,
          gallery_name: photos[0]?.galleries?.name || '',
          total_photos: totalPhotos,
          selected_photos: selectedPhotos,
          selection_rate: totalPhotos > 0 ? (selectedPhotos / totalPhotos) * 100 : 0,
          most_selected: sorted.slice(0, 10),
          least_selected: sorted.slice(-10).reverse(),
        } as GalleryAnalytics;
      }

      // Otherwise, fetch analytics for all owned galleries
      const { data: galleries, error: galleriesError } = await supabase
        .from('galleries')
        .select('id, name')
        .eq('owner_id', user.id);

      if (galleriesError) throw galleriesError;

      const analytics = await Promise.all(
        (galleries || []).map(async (gallery) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('id')
            .eq('gallery_id', gallery.id);

          const totalPhotos = photos?.length || 0;

          // Get selected photos count
          const { data: selections } = await supabase
            .from('photo_selections')
            .select('photo_id')
            .in('photo_id', photos?.map(p => p.id) || []);

          const selectedPhotos = new Set(selections?.map(s => s.photo_id) || []).size;

          return {
            gallery_id: gallery.id,
            gallery_name: gallery.name,
            total_photos: totalPhotos,
            selected_photos: selectedPhotos,
            selection_rate: totalPhotos > 0 ? (selectedPhotos / totalPhotos) * 100 : 0,
          };
        })
      );

      return analytics.sort((a, b) => b.selection_rate - a.selection_rate);
    },
  });
};

