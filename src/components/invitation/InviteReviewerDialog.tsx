import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inviteReviewerSchema, InviteReviewerInput } from '@/lib/gallery-types';
import { useCreateInvitation } from '@/hooks/useInvitations';
import { CopyLinkButton } from './CopyLinkButton';
import { InvitationsList } from './InvitationsList';

interface InviteReviewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteReviewerDialog = ({
  open,
  onOpenChange,
}: InviteReviewerDialogProps) => {
  const createInvitation = useCreateInvitation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  const form = useForm<InviteReviewerInput>({
    resolver: zodResolver(inviteReviewerSchema),
    defaultValues: {
      email: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: InviteReviewerInput) => {
    setIsSubmitting(true);
    try {
      const result = await createInvitation.mutateAsync(data);
      const link = `${window.location.origin}/invite/${result.token}`;
      setInvitationLink(link);
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setInvitationLink(null);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Reviewer</DialogTitle>
          <DialogDescription>
            Create an invitation link for a new reviewer to join
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Invitation</TabsTrigger>
            <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            {invitationLink ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Invitation created successfully!
                  </p>
                  <p className="mt-2 text-sm text-green-800 dark:text-green-200">
                    Share this link with the reviewer. It will expire in 7 days.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Invitation Link</label>
                  <div className="flex gap-2">
                    <Input value={invitationLink} readOnly className="font-mono text-sm" />
                    <CopyLinkButton link={invitationLink} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setInvitationLink(null)}>
                    Create Another
                  </Button>
                  <Button onClick={handleClose}>Done</Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="reviewer@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Invitation'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </TabsContent>

          <TabsContent value="pending">
            <InvitationsList />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
