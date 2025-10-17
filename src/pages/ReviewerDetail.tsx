import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FolderOpen, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ManageAccessDialog } from '@/components/access/ManageAccessDialog';
import { useState } from 'react';

const ReviewerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manageAccessOpen, setManageAccessOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<any>(null);

  const { data: reviewer, isLoading } = useQuery({
    queryKey: ['reviewer-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No reviewer ID');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get reviewer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;

      // Get owned galleries
      const { data: ownedGalleries } = await supabase
        .from('galleries')
        .select('id, name')
        .eq('owner_id', user.id);

      const galleryIds = ownedGalleries?.map(g => g.id) || [];

      // Get gallery access
      const { data: access } = galleryIds.length > 0
        ? await supabase
            .from('gallery_access')
            .select('gallery_id, granted_at')
            .eq('reviewer_id', id)
            .in('gallery_id', galleryIds)
        : { data: [] };

      // Get selections
      let selectionCount = 0;
      if (galleryIds.length > 0) {
        const { data: photos } = await supabase
          .from('photos')
          .select('id')
          .in('gallery_id', galleryIds);

        const photoIds = photos?.map(p => p.id) || [];

        if (photoIds.length > 0) {
          const { count } = await supabase
            .from('photo_selections')
            .select('id', { count: 'exact', head: true })
            .eq('reviewer_id', id)
            .in('photo_id', photoIds);
          selectionCount = count || 0;
        }
      }

      // Combine gallery data with access info
      const galleriesWithAccess = ownedGalleries?.map(gallery => ({
        ...gallery,
        hasAccess: access?.some(a => a.gallery_id === gallery.id) || false,
        grantedAt: access?.find(a => a.gallery_id === gallery.id)?.granted_at,
      })) || [];

      return {
        ...profile,
        galleries: galleriesWithAccess,
        selectionCount,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!reviewer) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8">
          <p>Reviewer not found</p>
        </div>
      </Layout>
    );
  }

  const handleManageAccess = (gallery: any) => {
    setSelectedGallery(gallery);
    setManageAccessOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/reviewers')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reviewers
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold">{reviewer.full_name || 'No name'}</h1>
          <p className="mt-2 text-muted-foreground">{reviewer.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Joined</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {format(new Date(reviewer.created_at), 'MMM dd, yyyy')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Gallery Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {reviewer.galleries.filter((g: any) => g.hasAccess).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Total Selections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reviewer.selectionCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Access */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Access</CardTitle>
            <CardDescription>
              Manage which galleries this reviewer can access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewer.galleries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No galleries available
              </p>
            ) : (
              <div className="space-y-3">
                {reviewer.galleries.map((gallery: any) => (
                  <div 
                    key={gallery.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{gallery.name}</p>
                        {gallery.hasAccess && gallery.grantedAt && (
                          <p className="text-xs text-muted-foreground">
                            Access granted {format(new Date(gallery.grantedAt), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={gallery.hasAccess ? 'default' : 'outline'}>
                        {gallery.hasAccess ? 'Has Access' : 'No Access'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageAccess(gallery)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ManageAccessDialog
          open={manageAccessOpen}
          onOpenChange={setManageAccessOpen}
          gallery={selectedGallery}
        />
      </div>
    </Layout>
  );
};

export default ReviewerDetail;
