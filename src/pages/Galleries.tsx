import { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useGalleries } from '@/hooks/useGalleries';
import { GalleryTree } from '@/components/gallery/GalleryTree';
import { CreateGalleryDialog } from '@/components/gallery/CreateGalleryDialog';
import { EditGalleryDialog } from '@/components/gallery/EditGalleryDialog';
import { DeleteGalleryDialog } from '@/components/gallery/DeleteGalleryDialog';
import { ManageAccessDialog } from '@/components/access/ManageAccessDialog';
import { InviteReviewerDialog } from '@/components/invitation/InviteReviewerDialog';
import { Button } from '@/components/ui/button';
import { FolderPlus, UserPlus } from 'lucide-react';
import { GalleryWithDetails } from '@/lib/gallery-types';
import { Skeleton } from '@/components/ui/skeleton';

const Galleries = () => {
  const { role } = useAuth();
  const { data: galleries, isLoading } = useGalleries();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryWithDetails | null>(null);
  const [parentGalleryId, setParentGalleryId] = useState<string | null>(null);

  const isOwner = role === 'owner';

  const handleEdit = (gallery: GalleryWithDetails) => {
    setSelectedGallery(gallery);
    setEditDialogOpen(true);
  };

  const handleDelete = (gallery: GalleryWithDetails) => {
    setSelectedGallery(gallery);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubGallery = (parentId: string) => {
    setParentGalleryId(parentId);
    setCreateDialogOpen(true);
  };

  const handleManageAccess = (gallery: GalleryWithDetails) => {
    setSelectedGallery(gallery);
    setAccessDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Galleries</h1>
            <p className="mt-2 text-muted-foreground">
              {isOwner ? 'Manage your photo galleries' : 'View your assigned galleries'}
            </p>
          </div>
          {isOwner && (
            <div className="flex gap-2">
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Reviewer
              </Button>
              <Button onClick={() => {
                setParentGalleryId(null);
                setCreateDialogOpen(true);
              }}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Gallery
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <GalleryTree
            galleries={galleries || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCreateSubGallery={handleCreateSubGallery}
            onManageAccess={handleManageAccess}
          />
        )}

        {isOwner && (
          <>
            <CreateGalleryDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              parentGalleryId={parentGalleryId}
              galleries={galleries || []}
            />
            <EditGalleryDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              gallery={selectedGallery}
              galleries={galleries || []}
            />
            <DeleteGalleryDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              gallery={selectedGallery}
            />
            <ManageAccessDialog
              open={accessDialogOpen}
              onOpenChange={setAccessDialogOpen}
              gallery={selectedGallery}
            />
            <InviteReviewerDialog
              open={inviteDialogOpen}
              onOpenChange={setInviteDialogOpen}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Galleries;
