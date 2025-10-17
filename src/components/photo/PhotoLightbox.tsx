import { useEffect, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Photo } from '@/lib/gallery-types';

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const PhotoLightbox = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}: PhotoLightboxProps) => {
  const slides = photos.map((photo) => ({
    src: photo.thumbnail_url,
    alt: photo.filename,
  }));

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  return (
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
  );
};
