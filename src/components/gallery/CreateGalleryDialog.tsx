import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGallerySchema, CreateGalleryInput, Gallery } from '@/lib/gallery-types';
import { useCreateGallery } from '@/hooks/useGalleries';
import { useAuth } from '@/contexts/AuthContext';

interface CreateGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentGalleryId?: string | null;
  galleries: Gallery[];
}

export const CreateGalleryDialog = ({
  open,
  onOpenChange,
  parentGalleryId = null,
  galleries,
}: CreateGalleryDialogProps) => {
  const { user } = useAuth();
  const createGallery = useCreateGallery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGalleryInput>({
    resolver: zodResolver(createGallerySchema),
    defaultValues: {
      name: '',
      description: '',
      parent_gallery_id: parentGalleryId,
    },
  });

  const onSubmit = async (data: CreateGalleryInput) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await createGallery.mutateAsync({
        ...data,
        owner_id: user.id,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Gallery</DialogTitle>
          <DialogDescription>
            Create a new gallery to organize your photos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter gallery name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter gallery description (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_gallery_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Gallery (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent gallery" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent (top level)</SelectItem>
                      {galleries.map((gallery) => (
                        <SelectItem key={gallery.id} value={gallery.id}>
                          {gallery.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Gallery'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
