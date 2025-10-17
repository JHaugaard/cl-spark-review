import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GalleryWithDetails } from '@/lib/gallery-types';
import { useDeleteGallery } from '@/hooks/useGalleries';

interface DeleteGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: GalleryWithDetails | null;
}

export const DeleteGalleryDialog = ({
  open,
  onOpenChange,
  gallery,
}: DeleteGalleryDialogProps) => {
  const deleteGallery = useDeleteGallery();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!gallery) return;

    setIsDeleting(true);
    try {
      await deleteGallery.mutateAsync(gallery.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const photoCount = gallery?.photo_count || 0;
  const subgalleryCount = gallery?.subgallery_count || 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>{gallery?.name}</strong>?
            </p>
            {(photoCount > 0 || subgalleryCount > 0) && (
              <p className="font-semibold text-destructive">
                Warning: This will permanently delete:
              </p>
            )}
            {photoCount > 0 && (
              <p className="text-destructive">• {photoCount} photo{photoCount !== 1 ? 's' : ''}</p>
            )}
            {subgalleryCount > 0 && (
              <p className="text-destructive">
                • {subgalleryCount} sub-galler{subgalleryCount !== 1 ? 'ies' : 'y'} and all their photos
              </p>
            )}
            <p className="mt-4">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Gallery'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
