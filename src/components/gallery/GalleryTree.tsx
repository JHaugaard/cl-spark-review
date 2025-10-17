import { GalleryWithDetails } from '@/lib/gallery-types';
import { GalleryCard } from './GalleryCard';

interface GalleryTreeProps {
  galleries: GalleryWithDetails[];
  onEdit: (gallery: GalleryWithDetails) => void;
  onDelete: (gallery: GalleryWithDetails) => void;
  onCreateSubGallery: (parentId: string) => void;
  onManageAccess: (gallery: GalleryWithDetails) => void;
}

export const GalleryTree = ({
  galleries,
  onEdit,
  onDelete,
  onCreateSubGallery,
  onManageAccess,
}: GalleryTreeProps) => {
  // Organize galleries into a tree structure
  const topLevelGalleries = galleries.filter((g) => !g.parent_gallery_id);
  
  const renderGallery = (gallery: GalleryWithDetails, depth: number = 0) => {
    const subGalleries = galleries.filter((g) => g.parent_gallery_id === gallery.id);
    
    return (
      <div key={gallery.id} style={{ marginLeft: depth > 0 ? `${depth * 2}rem` : 0 }}>
        {depth > 0 && (
          <div className="mb-2 flex items-center text-sm text-muted-foreground">
            <div className="mr-2 h-px flex-1 bg-border" />
            <span>Sub-gallery of parent</span>
            <div className="ml-2 h-px flex-1 bg-border" />
          </div>
        )}
        <GalleryCard
          gallery={gallery}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateSubGallery={onCreateSubGallery}
          onManageAccess={onManageAccess}
        />
        {subGalleries.length > 0 && (
          <div className="mt-4 space-y-4">
            {subGalleries.map((subGallery) => renderGallery(subGallery, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (galleries.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No galleries yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first gallery to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topLevelGalleries.map((gallery) => renderGallery(gallery))}
    </div>
  );
};
