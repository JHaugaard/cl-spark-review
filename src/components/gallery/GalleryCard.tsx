import { GalleryWithDetails } from '@/lib/gallery-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Image, FolderPlus, Edit, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GalleryCardProps {
  gallery: GalleryWithDetails;
  onEdit: (gallery: GalleryWithDetails) => void;
  onDelete: (gallery: GalleryWithDetails) => void;
  onCreateSubGallery: (parentId: string) => void;
  onManageAccess: (gallery: GalleryWithDetails) => void;
}

export const GalleryCard = ({
  gallery,
  onEdit,
  onDelete,
  onCreateSubGallery,
  onManageAccess,
}: GalleryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{gallery.name}</CardTitle>
          </div>
        </div>
        {gallery.description && (
          <CardDescription className="line-clamp-2">{gallery.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <span>{gallery.photo_count || 0} photos</span>
          </div>
          {(gallery.subgallery_count || 0) > 0 && (
            <div className="flex items-center gap-1">
              <FolderOpen className="h-4 w-4" />
              <span>{gallery.subgallery_count} sub-galleries</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => navigate(`/galleries/${gallery.id}`)}
        >
          <Image className="mr-2 h-4 w-4" />
          View Photos
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCreateSubGallery(gallery.id)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Sub-Gallery
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(gallery)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onManageAccess(gallery)}
        >
          <Users className="mr-2 h-4 w-4" />
          Access
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(gallery)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
