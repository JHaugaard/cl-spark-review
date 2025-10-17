import { Badge } from '@/components/ui/badge';
import { useGallerySelections } from '@/hooks/usePhotoSelections';

interface SelectionCounterProps {
  galleryId: string;
}

export const SelectionCounter = ({ galleryId }: SelectionCounterProps) => {
  const { data: selections } = useGallerySelections(galleryId);
  const count = selections?.length ?? 0;

  if (count === 0) return null;

  return (
    <Badge variant="secondary" className="text-sm">
      {count} photo{count !== 1 ? 's' : ''} selected
    </Badge>
  );
};
