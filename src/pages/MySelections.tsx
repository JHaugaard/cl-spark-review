import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePhotoSelections, useClearAllSelections } from '@/hooks/usePhotoSelections';
import { SelectionCard } from '@/components/selection/SelectionCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, FolderOpen } from 'lucide-react';

const MySelections = () => {
  const navigate = useNavigate();
  const { data: selections, isLoading } = usePhotoSelections();
  const clearAll = useClearAllSelections();

  // Group selections by gallery
  const groupedSelections = selections?.reduce((acc, selection) => {
    const galleryName = selection.photos?.galleries?.name || 'Unknown Gallery';
    if (!acc[galleryName]) {
      acc[galleryName] = [];
    }
    acc[galleryName].push(selection);
    return acc;
  }, {} as Record<string, typeof selections>);

  const totalCount = selections?.length ?? 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (totalCount === 0) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <h1 className="text-4xl font-bold mb-8">My Selected Photos</h1>
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No photos selected yet</h3>
              <p className="mt-2 text-sm text-muted-foreground mb-4">
                Browse galleries to select photos you like
              </p>
              <Button onClick={() => navigate('/galleries')}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Browse Galleries
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Selected Photos</h1>
            <p className="mt-2 text-muted-foreground">
              You've selected {totalCount} photo{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={clearAll.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Selections
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all selections?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {totalCount} selected photo{totalCount !== 1 ? 's' : ''} and their notes. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => clearAll.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Grouped Selections */}
        <Accordion type="multiple" defaultValue={Object.keys(groupedSelections || {})} className="space-y-4">
          {Object.entries(groupedSelections || {}).map(([galleryName, gallerySelections]) => (
            <AccordionItem key={galleryName} value={galleryName} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{galleryName}</h2>
                  <Badge variant="secondary">
                    {gallerySelections.length} photo{gallerySelections.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {gallerySelections.map((selection) => (
                    <SelectionCard
                      key={selection.id}
                      selection={selection}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
};

export default MySelections;
