import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Photo, UploadProgress } from '@/lib/gallery-types';
import { validatePhotoFile, generateUniqueFilename, getStoragePath } from '@/lib/photo-utils';
import { toast } from 'sonner';

export const usePhotos = (galleryId: string | undefined) => {
  return useQuery({
    queryKey: ['photos', galleryId],
    queryFn: async () => {
      if (!galleryId) throw new Error('Gallery ID is required');

      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('upload_order', { ascending: true, nullsFirst: false })
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!galleryId,
  });
};

export const useUploadPhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      galleryId,
      files,
      onProgress,
    }: {
      galleryId: string;
      files: File[];
      onProgress: (progress: UploadProgress[]) => void;
    }) => {
      const uploadProgress: UploadProgress[] = files.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }));

      onProgress([...uploadProgress]);

      const uploadFile = async (file: File, index: number) => {
        // Validate file
        const validation = validatePhotoFile(file);
        if (!validation.valid) {
          uploadProgress[index] = {
            ...uploadProgress[index],
            status: 'error',
            error: validation.error,
          };
          onProgress([...uploadProgress]);
          return;
        }

        try {
          uploadProgress[index] = {
            ...uploadProgress[index],
            status: 'uploading',
            progress: 0,
          };
          onProgress([...uploadProgress]);

          // Generate unique photo ID and filename
          const photoId = crypto.randomUUID();
          const storagePath = getStoragePath(galleryId, photoId);

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('gallery-photos')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          uploadProgress[index].progress = 50;
          onProgress([...uploadProgress]);

          // Get public URL (signed URL for private bucket)
          const { data: { publicUrl } } = supabase.storage
            .from('gallery-photos')
            .getPublicUrl(storagePath);

          // Create database record
          const { error: dbError } = await supabase.from('photos').insert({
            id: photoId,
            gallery_id: galleryId,
            filename: file.name,
            storage_path: storagePath,
            thumbnail_url: publicUrl,
            upload_order: index,
            metadata: {
              size: file.size,
              type: file.type,
            },
          });

          if (dbError) {
            // If database insert fails, clean up the uploaded file
            await supabase.storage.from('gallery-photos').remove([storagePath]);
            throw dbError;
          }

          uploadProgress[index] = {
            ...uploadProgress[index],
            status: 'success',
            progress: 100,
            photoId,
          };
          onProgress([...uploadProgress]);
        } catch (error: any) {
          uploadProgress[index] = {
            ...uploadProgress[index],
            status: 'error',
            error: error.message || 'Upload failed',
          };
          onProgress([...uploadProgress]);
        }
      };

      // Upload files with max 3 concurrent uploads
      const chunks: File[][] = [];
      for (let i = 0; i < files.length; i += 3) {
        chunks.push(files.slice(i, i + 3));
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map((file, chunkIndex) => {
            const actualIndex = chunks.indexOf(chunk) * 3 + chunkIndex;
            return uploadFile(file, actualIndex);
          })
        );
      }

      return uploadProgress;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.galleryId] });
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      
      const successCount = _.filter((p) => p.status === 'success').length;
      const errorCount = _.filter((p) => p.status === 'error').length;

      if (successCount > 0) {
        toast.success(`${successCount} photo${successCount > 1 ? 's' : ''} uploaded successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} photo${errorCount > 1 ? 's' : ''} failed to upload`);
      }
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, storagePath }: { photoId: string; storagePath: string }) => {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      // Then delete from storage
      const { error: storageError } = await supabase.storage
        .from('gallery-photos')
        .remove([storagePath]);

      if (storageError) {
        console.error('Failed to delete from storage:', storageError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success('Photo deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete photo');
    },
  });
};
