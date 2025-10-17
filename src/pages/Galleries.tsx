import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useGalleries } from '@/hooks/useGalleries';
import { GalleryCard } from '@/components/gallery/GalleryCard';
import { CreateGalleryDialog } from '@/components/gallery/CreateGalleryDialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Galleries = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: galleries, isLoading } = useGalleries();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const isOwner = role === 'owner';

  // Filter to show only root galleries (no parent)
  const rootGalleries = galleries?.filter((g) => !g.parent_gallery_id) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!rootGalleries || rootGalleries.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Galleries</h1>
            </div>
            {isOwner && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Gallery
              </Button>
            )}
          </div>

          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No galleries yet</h3>
              {isOwner && (
                <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Gallery
                </Button>
              )}
            </div>
          </div>

          {isOwner && (
            <CreateGalleryDialog 
              open={createDialogOpen} 
              onOpenChange={setCreateDialogOpen}
              galleries={galleries || []}
            />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Galleries</h1>
          </div>
          {isOwner && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Gallery
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rootGalleries.map((gallery) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              onNavigate={(id) => navigate(`/galleries/${id}`)}
            />
          ))}
        </div>

        {isOwner && (
          <CreateGalleryDialog 
            open={createDialogOpen} 
            onOpenChange={setCreateDialogOpen}
            galleries={galleries || []}
          />
        )}
      </div>
    </Layout>
  );
};

export default Galleries;
