import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';
import { useToggleSelection, useUpdateSelectionNotes } from '@/hooks/usePhotoSelections';
import { PhotoSelectionWithDetails } from '@/lib/gallery-types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDebounce } from '@/hooks/useDebounce';

interface SelectionCardProps {
  selection: PhotoSelectionWithDetails;
}

export const SelectionCard = ({ selection }: SelectionCardProps) => {
  const [notes, setNotes] = useState(selection.notes || '');
  const [showSaved, setShowSaved] = useState(false);
  const debouncedNotes = useDebounce(notes, 1000);
  
  const toggleSelection = useToggleSelection();
  const updateNotes = useUpdateSelectionNotes();

  const photo = selection.photos;
  const galleryName = photo?.galleries?.name || 'Unknown Gallery';
  const charCount = notes.length;
  const maxChars = 500;

  // Auto-save notes when debounced value changes
  useEffect(() => {
    if (debouncedNotes !== selection.notes) {
      updateNotes.mutate(
        { photoId: selection.photo_id, notes: debouncedNotes },
        {
          onSuccess: () => {
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
          },
        }
      );
    }
  }, [debouncedNotes]);

  const handleRemove = () => {
    toggleSelection.mutate({ 
      photoId: selection.photo_id, 
      isSelected: true 
    });
  };

  return (
    <Card className="overflow-hidden group">
      <div className="aspect-square relative bg-muted">
        <img
          src={photo?.thumbnail_url}
          alt={photo?.filename}
          className="w-full h-full object-cover"
        />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from selections?</AlertDialogTitle>
              <AlertDialogDescription>
                This photo will be removed from your selections. Any notes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="p-3">
        <Badge variant="outline" className="text-xs mb-2">
          {galleryName}
        </Badge>
        
        <div className="relative">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note (optional)..."
            className="min-h-[80px] text-sm resize-none"
            maxLength={maxChars}
          />
          
          <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
            <span>{charCount}/{maxChars}</span>
            {showSaved && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
