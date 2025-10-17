import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityItem {
  id: string;
  type: 'selection' | 'access_grant' | 'photo_upload';
  timestamp: string;
  description: string;
  relatedUser?: string;
  relatedGallery?: string;
}

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const activities: ActivityItem[] = [];

      // Fetch recent selections
      const { data: selections } = await supabase
        .from('photo_selections')
        .select(`
          id,
          selected_at,
          profiles!photo_selections_reviewer_id_fkey(full_name),
          photos!photo_selections_photo_id_fkey(
            filename,
            galleries!photos_gallery_id_fkey(name, owner_id)
          )
        `)
        .order('selected_at', { ascending: false })
        .limit(limit);

      if (selections) {
        selections
          .filter((s: any) => s.photos?.galleries?.owner_id === user.id)
          .forEach((s: any) => {
            activities.push({
              id: s.id,
              type: 'selection',
              timestamp: s.selected_at,
              description: `${s.profiles?.full_name || 'A reviewer'} selected a photo`,
              relatedUser: s.profiles?.full_name,
              relatedGallery: s.photos?.galleries?.name,
            });
          });
      }

      // Fetch recent access grants
      const { data: accessGrants } = await supabase
        .from('gallery_access')
        .select(`
          id,
          granted_at,
          profiles!gallery_access_reviewer_id_fkey(full_name),
          galleries!gallery_access_gallery_id_fkey(name, owner_id)
        `)
        .order('granted_at', { ascending: false })
        .limit(limit);

      if (accessGrants) {
        accessGrants
          .filter((a: any) => a.galleries?.owner_id === user.id)
          .forEach((a: any) => {
            activities.push({
              id: a.id,
              type: 'access_grant',
              timestamp: a.granted_at,
              description: `${a.profiles?.full_name || 'A reviewer'} gained access`,
              relatedUser: a.profiles?.full_name,
              relatedGallery: a.galleries?.name,
            });
          });
      }

      // Fetch recent photo uploads
      const { data: uploads } = await supabase
        .from('photos')
        .select(`
          id,
          uploaded_at,
          filename,
          galleries!photos_gallery_id_fkey(name, owner_id)
        `)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (uploads) {
        uploads
          .filter((u: any) => u.galleries?.owner_id === user.id)
          .forEach((u: any) => {
            activities.push({
              id: u.id,
              type: 'photo_upload',
              timestamp: u.uploaded_at,
              description: `Photo uploaded to ${u.galleries?.name}`,
              relatedGallery: u.galleries?.name,
            });
          });
      }

      // Sort all activities by timestamp
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
  });
};
