import { useState, useRef, useEffect } from 'react';
import { Photo } from '@/lib/gallery-types';
import { PhotoCard } from './PhotoCard';
import { PhotoLightbox } from './PhotoLightbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  onDelete?: (photo: Photo) => void;
}

export const PhotoGrid = ({ photos, isLoading, onDelete }: PhotoGridProps) => {
  const { role } = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isOwner = role === 'owner';

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisiblePhotos((prev) => new Set([...prev, index]));
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No photos yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your first photos to this gallery
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            isVisible={visiblePhotos.has(index)}
            onPhotoClick={() => handlePhotoClick(index)}
            onDelete={isOwner && onDelete ? onDelete : undefined}
            observerRef={observerRef}
          />
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        currentIndex={currentPhotoIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentPhotoIndex}
      />
    </>
  );
};
