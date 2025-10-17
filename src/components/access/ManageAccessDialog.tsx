import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GalleryWithDetails } from '@/lib/gallery-types';
import { ReviewerList } from './ReviewerList';
import { useReviewers, useGalleryAccess, useToggleGalleryAccess } from '@/hooks/useGalleryAccess';
import { Skeleton } from '@/components/ui/skeleton';

interface ManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: GalleryWithDetails | null;
}

export const ManageAccessDialog = ({
  open,
  onOpenChange,
  gallery,
}: ManageAccessDialogProps) => {
  const { data: reviewers, isLoading: reviewersLoading } = useReviewers();
  const { data: access, isLoading: accessLoading } = useGalleryAccess(gallery?.id);
  const toggleAccess = useToggleGalleryAccess();

  const handleToggle = async (reviewerId: string, hasAccess: boolean) => {
    if (!gallery) return;

    await toggleAccess.mutateAsync({
      galleryId: gallery.id,
      reviewerId,
      grant: !hasAccess,
    });
  };

  const reviewersWithAccess = reviewers?.map((reviewer) => ({
    ...reviewer,
    hasAccess: access?.some((a) => a.reviewer_id === reviewer.id) || false,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Gallery Access</DialogTitle>
          <DialogDescription>
            Control which reviewers can access <strong>{gallery?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {gallery?.parent_gallery_id && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">Note about sub-galleries:</p>
            <p className="mt-1 text-blue-800 dark:text-blue-200">
              Reviewers with access to the parent gallery automatically inherit access to this sub-gallery.
            </p>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {reviewersLoading || accessLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          ) : reviewersWithAccess && reviewersWithAccess.length > 0 ? (
            <ReviewerList
              reviewers={reviewersWithAccess}
              onToggle={handleToggle}
              disabled={toggleAccess.isPending}
            />
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="font-semibold">No reviewers yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Invite your first reviewer to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
