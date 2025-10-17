import { useEffect, useRef } from 'react';
import { Photo } from '@/lib/gallery-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isVisible: boolean;
  onPhotoClick: () => void;
  onDelete?: (photo: Photo) => void;
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
}

export const PhotoCard = ({ 
  photo, 
  index, 
  isVisible, 
  onPhotoClick, 
  onDelete,
  observerRef 
}: PhotoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }

    return () => {
      if (element && observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, [observerRef]);

  return (
    <Card 
      ref={cardRef}
      data-index={index}
      className="overflow-hidden group relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    >
      <div className="aspect-square relative bg-muted">
        {isVisible ? (
          <img
            src={photo.thumbnail_url}
            alt={photo.filename}
            className="w-full h-full object-cover"
            onClick={onPhotoClick}
            loading="lazy"
          />
        ) : (
          <Skeleton className="w-full h-full" />
        )}
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this photo? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(photo)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-muted-foreground truncate">
          {photo.filename}
        </p>
      </div>
    </Card>
  );
};
