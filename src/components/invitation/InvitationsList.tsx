import { usePendingInvitations, useRevokeInvitation } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyLinkButton } from './CopyLinkButton';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const InvitationsList = () => {
  const { data: invitations, isLoading } = usePendingInvitations();
  const revokeInvitation = useRevokeInvitation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="font-semibold">No pending invitations</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a new invitation to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] space-y-3 overflow-y-auto">
      {invitations.map((invitation) => {
        const invitationLink = `${window.location.origin}/invite/${invitation.token}`;
        const expiresAt = new Date(invitation.expires_at);

        return (
          <div
            key={invitation.id}
            className="rounded-lg border p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{invitation.full_name}</p>
                <p className="text-sm text-muted-foreground">{invitation.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Expires: {format(expiresAt, 'PPp')}
                </p>
              </div>
              <div className="flex gap-2">
                <CopyLinkButton link={invitationLink} />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => revokeInvitation.mutate(invitation.id)}
                  disabled={revokeInvitation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
