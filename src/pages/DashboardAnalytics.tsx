import Layout from '@/components/Layout';
import { useGalleryAnalytics } from '@/hooks/useGalleryAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Award } from 'lucide-react';

const DashboardAnalytics = () => {
  const { data: analytics, isLoading } = useGalleryAnalytics();

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">🥇 1st</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">🥈 2nd</Badge>;
    if (index === 2) return <Badge className="bg-orange-600">🥉 3rd</Badge>;
    return <Badge variant="outline">{index + 1}</Badge>;
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Gallery Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Selection rates and popularity insights
          </p>
        </div>

        {/* Analytics Cards */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : analytics && Array.isArray(analytics) && analytics.length > 0 ? (
          <div className="space-y-6">
            {analytics.map((gallery: any, index) => (
              <Card key={gallery.gallery_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {gallery.gallery_name}
                        {index < 3 && <Award className="h-5 w-5 text-yellow-500" />}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {gallery.selected_photos} of {gallery.total_photos} photos selected
                      </CardDescription>
                    </div>
                    {getRankBadge(index)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Selection Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Selection Rate</span>
                        <span className="text-sm text-muted-foreground">
                          {gallery.selection_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${gallery.selection_rate}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{gallery.total_photos}</p>
                        <p className="text-xs text-muted-foreground">Total Photos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{gallery.selected_photos}</p>
                        <p className="text-xs text-muted-foreground">Selected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {gallery.total_photos - gallery.selected_photos}
                        </p>
                        <p className="text-xs text-muted-foreground">Unselected</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No analytics available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload photos and invite reviewers to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DashboardAnalytics;
