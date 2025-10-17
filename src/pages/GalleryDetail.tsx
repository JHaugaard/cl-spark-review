import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useGallery } from '@/hooks/useGalleries';
import { usePhotos, useDeletePhoto } from '@/hooks/usePhotos';
import { useSubGalleries } from '@/hooks/useSubGalleries';
import { PhotoGrid } from '@/components/photo/PhotoGrid';
import { PhotoUploadDialog } from '@/components/photo/PhotoUploadDialog';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { SelectionCounter } from '@/components/photo/SelectionCounter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/lib/gallery-types';

const GalleryDetail = () => {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: gallery, isLoading: galleryLoading, error: galleryError } = useGallery(galleryId);
  const { data: photos, isLoading: photosLoading } = usePhotos(galleryId);
  const { data: subGalleries, isLoading: subGalleriesLoading } = useSubGalleries(galleryId);
  const deletePhoto = useDeletePhoto();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState<Gallery[]>([]);

  const isOwner = role === 'owner';
  const isGuest = role === 'guest';

  // Build breadcrumb path
  useEffect(() => {
    const buildBreadcrumbPath = async () => {
      if (!gallery) return;

      const path: Gallery[] = [gallery];
      let currentGallery = gallery;

      while (currentGallery.parent_gallery_id) {
        const { data: parentGallery } = await supabase
          .from('galleries')
          .select('*')
          .eq('id', currentGallery.parent_gallery_id)
          .single();

        if (parentGallery) {
          path.unshift(parentGallery);
          currentGallery = parentGallery;
        } else {
          break;
        }
      }

      setBreadcrumbPath(path);
    };

    buildBreadcrumbPath();
  }, [gallery]);

  // Access denied check
  if (galleryError) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-4">
              <p className="font-semibold">You don't have access to this gallery.</p>
              <p>Contact the photographer for access.</p>
              <Button onClick={() => navigate('/galleries')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Galleries
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/galleries')} className="cursor-pointer flex items-center gap-1">
                <Home className="h-4 w-4" />
                Galleries
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbPath.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbPath.length - 1 ? (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => navigate(`/galleries/${item.id}`)}
                      className="cursor-pointer"
                    >
                      {item.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{gallery?.name || 'Gallery'}</h1>
            {gallery?.description && (
              <p className="mt-2 text-muted-foreground">{gallery.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{photos?.length || 0} photo{photos?.length !== 1 ? 's' : ''}</span>
              {subGalleries && subGalleries.length > 0 && (
                <span>{subGalleries.length} sub-galler{subGalleries.length !== 1 ? 'ies' : 'y'}</span>
              )}
              {isGuest && galleryId && (
                <SelectionCounter galleryId={galleryId} />
              )}
            </div>
          </div>
          {isOwner && galleryId && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Add Photos
            </Button>
          )}
        </div>

        {/* Sub-Galleries */}
        {subGalleries && subGalleries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sub-Galleries</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subGalleries.map((subGallery) => (
                <GalleryCard
                  key={subGallery.id}
                  gallery={subGallery}
                  onNavigate={(id) => navigate(`/galleries/${id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Photos */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Photos</h2>
          <PhotoGrid
            photos={photos || []}
            isLoading={photosLoading}
            onDelete={
              isOwner
                ? (photo) => deletePhoto.mutate({ photoId: photo.id, storagePath: photo.storage_path })
                : undefined
            }
          />
        </div>

        {isOwner && galleryId && (
          <PhotoUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            galleryId={galleryId}
          />
        )}
      </div>
    </Layout>
  );
};

export default GalleryDetail;
