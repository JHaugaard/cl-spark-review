import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useGallery } from '@/hooks/useGalleries';
import { usePhotos, useDeletePhoto } from '@/hooks/usePhotos';
import { PhotoGrid } from '@/components/photo/PhotoGrid';
import { PhotoUploadDialog } from '@/components/photo/PhotoUploadDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload } from 'lucide-react';

const GalleryDetail = () => {
  const { galleryId } = useParams<{ galleryId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: gallery, isLoading: galleryLoading } = useGallery(galleryId);
  const { data: photos, isLoading: photosLoading } = usePhotos(galleryId);
  const deletePhoto = useDeletePhoto();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const isOwner = role === 'owner';

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/galleries')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Galleries
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{gallery?.name || 'Gallery'}</h1>
            {gallery?.description && (
              <p className="mt-2 text-muted-foreground">{gallery.description}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {photos?.length || 0} photo{photos?.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isOwner && galleryId && (
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Add Photos
            </Button>
          )}
        </div>

        <PhotoGrid
          photos={photos || []}
          isLoading={photosLoading}
          onDelete={(photo) => deletePhoto.mutate({ photoId: photo.id, storagePath: photo.storage_path })}
        />

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
