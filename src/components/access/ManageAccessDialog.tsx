import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GalleryWithDetails } from '@/lib/gallery-types';
import { GuestList } from './GuestList';
import { useGuests, useGalleryAccess, useToggleGalleryAccess } from '@/hooks/useGalleryAccess';
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
  const { data: guests, isLoading: guestsLoading } = useGuests();
  const { data: access, isLoading: accessLoading } = useGalleryAccess(gallery?.id);
  const toggleAccess = useToggleGalleryAccess();

  const handleToggle = async (guestId: string, hasAccess: boolean) => {
    if (!gallery) return;

    await toggleAccess.mutateAsync({
      galleryId: gallery.id,
      guestId,
      grant: !hasAccess,
    });
  };

  const guestsWithAccess = guests?.map((guest) => ({
    ...guest,
    hasAccess: access?.some((a) => a.reviewer_id === guest.id) || false,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Gallery Access</DialogTitle>
          <DialogDescription>
            Control which guests can access <strong>{gallery?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {gallery?.parent_gallery_id && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <p className="font-medium">Note about sub-galleries:</p>
            <p className="mt-1 text-blue-800 dark:text-blue-200">
              Guests with access to the parent gallery automatically inherit access to this sub-gallery.
            </p>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {guestsLoading || accessLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          ) : guestsWithAccess && guestsWithAccess.length > 0 ? (
            <GuestList
              guests={guestsWithAccess}
              onToggle={handleToggle}
              disabled={toggleAccess.isPending}
            />
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <h3 className="font-semibold">No guests yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Invite your first guest to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
