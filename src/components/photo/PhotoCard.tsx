import { useEffect, useRef } from 'react';
import { Photo } from '@/lib/gallery-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Heart } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToggleSelection } from '@/hooks/usePhotoSelections';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isVisible: boolean;
  onPhotoClick: () => void;
  onDelete?: (photo: Photo) => void;
  observerRef: React.MutableRefObject<IntersectionObserver | null>;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const PhotoCard = ({ 
  photo, 
  index, 
  isVisible, 
  onPhotoClick, 
  onDelete,
  observerRef,
  isSelected = false,
  onToggleSelection,
}: PhotoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { role } = useAuth();
  const toggleSelection = useToggleSelection();
  const isGuest = role === 'guest';

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      toggleSelection.mutate({ photoId: photo.id, isSelected });
    }
  };

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
      className={cn(
        "overflow-hidden group relative cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        isSelected && isGuest && "ring-2 ring-blue-500"
      )}
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

        {isGuest && onToggleSelection && (
          <button
            onClick={handleToggleSelection}
            className="absolute top-2 right-2 z-10 transition-transform hover:scale-110"
            aria-label={isSelected ? "Deselect photo" : "Select photo"}
          >
            <Heart
              className={cn(
                "h-6 w-6 drop-shadow-lg transition-all duration-200",
                isSelected 
                  ? "fill-red-500 text-red-500" 
                  : "fill-white/20 text-white stroke-2"
              )}
              style={{
                filter: isSelected ? 'none' : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
              }}
            />
          </button>
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
