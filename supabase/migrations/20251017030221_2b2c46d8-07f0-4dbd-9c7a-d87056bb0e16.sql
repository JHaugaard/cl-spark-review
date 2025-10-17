-- Create galleries table
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_galleries_parent ON public.galleries(parent_gallery_id);
CREATE INDEX IF NOT EXISTS idx_galleries_owner ON public.galleries(owner_id);

-- Enable RLS on galleries
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  upload_order INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_photos_gallery ON public.photos(gallery_id);

-- Enable RLS on photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create gallery_access table
CREATE TABLE IF NOT EXISTS public.gallery_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(gallery_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_gallery_access_gallery ON public.gallery_access(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_access_reviewer ON public.gallery_access(reviewer_id);

-- Enable RLS on gallery_access
ALTER TABLE public.gallery_access ENABLE ROW LEVEL SECURITY;

-- Security definer function to check gallery ownership
CREATE OR REPLACE FUNCTION public.is_gallery_owner(_user_id UUID, _gallery_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.galleries
    WHERE id = _gallery_id
      AND owner_id = _user_id
  )
$$;

-- Security definer function to check gallery access for reviewers
CREATE OR REPLACE FUNCTION public.has_gallery_access(_user_id UUID, _gallery_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.gallery_access
    WHERE gallery_id = _gallery_id
      AND reviewer_id = _user_id
  )
$$;

-- RLS policies for galleries
CREATE POLICY "Owners have full access to their galleries"
  ON public.galleries FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Reviewers can view assigned galleries"
  ON public.galleries FOR SELECT
  USING (public.has_gallery_access(auth.uid(), id));

-- RLS policies for photos
CREATE POLICY "Owners can manage photos in their galleries"
  ON public.photos FOR ALL
  USING (public.is_gallery_owner(auth.uid(), gallery_id));

CREATE POLICY "Reviewers can view photos in assigned galleries"
  ON public.photos FOR SELECT
  USING (public.has_gallery_access(auth.uid(), gallery_id));

-- RLS policies for gallery_access
CREATE POLICY "Owners can manage gallery access"
  ON public.gallery_access FOR ALL
  USING (public.is_gallery_owner(auth.uid(), gallery_id));

-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-photos', 'gallery-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for owners
CREATE POLICY "Owners can upload photos to their galleries"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gallery-photos' AND
    public.is_gallery_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Owners can read photos from their galleries"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gallery-photos' AND
    public.is_gallery_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Owners can delete photos from their galleries"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gallery-photos' AND
    public.is_gallery_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- Storage policies for reviewers
CREATE POLICY "Reviewers can read photos from assigned galleries"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'gallery-photos' AND
    public.has_gallery_access(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_gallery_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updating updated_at on galleries
CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON public.galleries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_gallery_updated_at();