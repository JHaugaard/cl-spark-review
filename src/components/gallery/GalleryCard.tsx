import { useEffect, useState } from 'react';
import { GalleryWithDetails } from '@/lib/gallery-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Trash2, Edit, Image, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EditGalleryDialog } from './EditGalleryDialog';
import { DeleteGalleryDialog } from './DeleteGalleryDialog';
import { ManageAccessDialog } from '@/components/access/ManageAccessDialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryCardProps {
  gallery: GalleryWithDetails;
  onNavigate: (galleryId: string) => void;
}

export const GalleryCard = ({ gallery, onNavigate }: GalleryCardProps) => {
  const { role } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);

  const isOwner = role === 'owner';

  useEffect(() => {
    const fetchPreviewImage = async () => {
      try {
        const { data: photos } = await supabase
          .from('photos')
          .select('thumbnail_url')
          .eq('gallery_id', gallery.id)
          .order('upload_order', { ascending: true })
          .limit(1);

        if (photos && photos.length > 0) {
          setPreviewUrl(photos[0].thumbnail_url);
        }
      } catch (error) {
        console.error('Error fetching preview:', error);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    fetchPreviewImage();
  }, [gallery.id]);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow overflow-hidden group">
        {/* Preview Image */}
        <div 
          className="aspect-video bg-muted relative cursor-pointer overflow-hidden"
          onClick={() => onNavigate(gallery.id)}
        >
          {isLoadingPreview ? (
            <Skeleton className="w-full h-full" />
          ) : previewUrl ? (
            <img
              src={previewUrl}
              alt={gallery.name}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <CardHeader onClick={() => onNavigate(gallery.id)} className="cursor-pointer">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {gallery.name}
              </CardTitle>
              {gallery.description && (
                <CardDescription className="mt-2 line-clamp-2">{gallery.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Image className="h-3 w-3" />
              <span>{gallery.photo_count || 0}</span>
            </Badge>
            {gallery.subgallery_count !== undefined && gallery.subgallery_count > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <FolderOpen className="h-3 w-3" />
                <span>{gallery.subgallery_count}</span>
              </Badge>
            )}
          </div>
          
          {isOwner && (
            <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAccessOpen(true)}
              >
                <Users className="h-4 w-4 mr-1" />
                Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <>
          <EditGalleryDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            gallery={gallery}
            galleries={[]}
          />
          <DeleteGalleryDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            gallery={gallery}
          />
          <ManageAccessDialog
            open={accessOpen}
            onOpenChange={setAccessOpen}
            gallery={gallery}
          />
        </>
      )}
    </>
  );
};
