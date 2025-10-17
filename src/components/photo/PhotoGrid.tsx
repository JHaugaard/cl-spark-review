import { Photo } from '@/lib/gallery-types';
import { PhotoCard } from './PhotoCard';
import { Skeleton } from '@/components/ui/skeleton';

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  onDelete: (photo: Photo) => void;
}

export const PhotoGrid = ({ photos, isLoading, onDelete }: PhotoGridProps) => {
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} onDelete={onDelete} />
      ))}
    </div>
  );
};
