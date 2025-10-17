import { useEffect, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Photo } from '@/lib/gallery-types';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleSelection, useGallerySelections } from '@/hooks/usePhotoSelections';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  galleryId?: string;
}

export const PhotoLightbox = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  galleryId,
}: PhotoLightboxProps) => {
  const { role } = useAuth();
  const { data: selections } = useGallerySelections(galleryId);
  const toggleSelection = useToggleSelection();
  const isGuest = role === 'guest';

  const slides = photos.map((photo) => ({
    src: photo.thumbnail_url,
    alt: photo.filename,
  }));

  const currentPhoto = photos[currentIndex];
  const isSelected = selections?.some(s => s.photo_id === currentPhoto?.id) ?? false;

  const handleToggleSelection = useCallback(() => {
    if (currentPhoto) {
      toggleSelection.mutate({ 
        photoId: currentPhoto.id, 
        isSelected 
      });
    }
  }, [currentPhoto, isSelected, toggleSelection]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  }, [currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  }, [currentIndex, photos.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 's':
        case 'S':
          if (isGuest) {
            e.preventDefault();
            handleToggleSelection();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose, isGuest, handleToggleSelection]);

  if (!isOpen) return null;

  return (
    <>
      <Lightbox
        open={isOpen}
        close={onClose}
        slides={slides}
        index={currentIndex}
        on={{
          view: ({ index }) => onIndexChange(index),
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
        carousel={{
          finite: true,
        }}
        render={{
          buttonPrev: currentIndex === 0 ? () => null : undefined,
          buttonNext: currentIndex === photos.length - 1 ? () => null : undefined,
        }}
      />
      
      {isGuest && (
        <Button
          onClick={handleToggleSelection}
          className="fixed top-6 right-20 z-[9999] bg-background/80 backdrop-blur-sm hover:bg-background/90"
          size="icon"
          variant="ghost"
          title={isSelected ? 'Deselect photo (S)' : 'Select photo (S)'}
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-all duration-200",
              isSelected ? "fill-red-500 text-red-500" : "text-foreground"
            )}
          />
        </Button>
      )}
    </>
  );
};
