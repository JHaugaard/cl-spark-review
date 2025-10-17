import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, GalleryWithDetails, CreateGalleryInput, EditGalleryInput } from '@/lib/gallery-types';
import { toast } from 'sonner';

export const useGalleries = () => {
  return useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data: galleries, error } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch photo counts for each gallery
      const galleriesWithCounts = await Promise.all(
        galleries.map(async (gallery) => {
          const [photoCount, subgalleryCount] = await Promise.all([
            supabase
              .from('photos')
              .select('id', { count: 'exact', head: true })
              .eq('gallery_id', gallery.id)
              .then((res) => res.count || 0),
            supabase
              .from('galleries')
              .select('id', { count: 'exact', head: true })
              .eq('parent_gallery_id', gallery.id)
              .then((res) => res.count || 0),
          ]);

          return {
            ...gallery,
            photo_count: photoCount,
            subgallery_count: subgalleryCount,
          } as GalleryWithDetails;
        })
      );

      return galleriesWithCounts;
    },
  });
};

export const useGallery = (galleryId: string | undefined) => {
  return useQuery({
    queryKey: ['gallery', galleryId],
    queryFn: async () => {
      if (!galleryId) throw new Error('Gallery ID is required');

      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', galleryId)
        .single();

      if (error) throw error;
      return data as Gallery;
    },
    enabled: !!galleryId,
  });
};

export const useCreateGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGalleryInput & { owner_id: string }) => {
      const { data, error } = await supabase
        .from('galleries')
        .insert({
          name: input.name,
          description: input.description || null,
          parent_gallery_id: input.parent_gallery_id || null,
          owner_id: input.owner_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success('Gallery created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create gallery');
    },
  });
};

export const useUpdateGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: EditGalleryInput & { id: string }) => {
      const { data, error } = await supabase
        .from('galleries')
        .update({
          name: input.name,
          description: input.description || null,
          parent_gallery_id: input.parent_gallery_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      queryClient.invalidateQueries({ queryKey: ['gallery', variables.id] });
      toast.success('Gallery updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update gallery');
    },
  });
};

export const useDeleteGallery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (galleryId: string) => {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', galleryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success('Gallery deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete gallery');
    },
  });
};
