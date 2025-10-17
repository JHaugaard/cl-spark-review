-- Update RLS policies for reviewer access

-- Drop existing reviewer policies if they exist
DROP POLICY IF EXISTS "Reviewers can view assigned galleries" ON galleries;
DROP POLICY IF EXISTS "Reviewers can view photos in assigned galleries" ON photos;

-- Create new reviewer access policies for galleries
CREATE POLICY "Reviewers can view assigned galleries"
  ON galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_access 
      WHERE gallery_access.gallery_id = galleries.id 
      AND gallery_access.reviewer_id = auth.uid()
    )
  );

-- Create new reviewer access policies for photos
CREATE POLICY "Reviewers can view photos in assigned galleries"
  ON photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_access 
      WHERE gallery_access.gallery_id = photos.gallery_id 
      AND gallery_access.reviewer_id = auth.uid()
    )
  );

-- Update storage policies for reviewers
CREATE POLICY "Reviewers can read assigned photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gallery-photos' AND
    EXISTS (
      SELECT 1 FROM gallery_access ga
      JOIN galleries g ON g.id = ga.gallery_id
      WHERE ga.reviewer_id = auth.uid()
      AND g.id::text = (storage.foldername(name))[1]
    )
  );