import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { editGallerySchema, EditGalleryInput, GalleryWithDetails } from '@/lib/gallery-types';
import { useUpdateGallery } from '@/hooks/useGalleries';

interface EditGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: GalleryWithDetails | null;
  galleries: GalleryWithDetails[];
}

export const EditGalleryDialog = ({
  open,
  onOpenChange,
  gallery,
  galleries,
}: EditGalleryDialogProps) => {
  const updateGallery = useUpdateGallery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditGalleryInput>({
    resolver: zodResolver(editGallerySchema),
    defaultValues: {
      name: '',
      description: '',
      parent_gallery_id: null,
    },
  });

  useEffect(() => {
    if (gallery) {
      form.reset({
        name: gallery.name,
        description: gallery.description || '',
        parent_gallery_id: gallery.parent_gallery_id,
      });
    }
  }, [gallery, form]);

  const onSubmit = async (data: EditGalleryInput) => {
    if (!gallery) return;
    
    setIsSubmitting(true);
    try {
      await updateGallery.mutateAsync({
        id: gallery.id,
        ...data,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out the current gallery and its descendants to prevent circular references
  const availableParents = galleries.filter((g) => g.id !== gallery?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Gallery</DialogTitle>
          <DialogDescription>
            Update the gallery details.
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
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    value={field.value || 'none'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent gallery" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent (top level)</SelectItem>
                      {availableParents.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
