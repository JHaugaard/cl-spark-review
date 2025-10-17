import { useState } from 'react';
import { Photo } from '@/lib/gallery-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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
import { formatFileSize } from '@/lib/photo-utils';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (photo: Photo) => void;
}

export const PhotoCard = ({ photo, onDelete }: PhotoCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg">
        <div className="aspect-square">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          <img
            src={photo.thumbnail_url}
            alt={photo.filename}
            className="h-full w-full object-cover"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-full flex-col justify-between p-3">
            <div className="text-xs text-white">
              <p className="truncate font-medium">{photo.filename}</p>
              {photo.metadata?.size && (
                <p className="text-white/80">{formatFileSize(photo.metadata.size)}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(photo)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
