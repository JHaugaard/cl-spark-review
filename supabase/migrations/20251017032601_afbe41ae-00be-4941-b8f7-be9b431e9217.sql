-- Create photo_selections table
create table photo_selections (
  id uuid default gen_random_uuid() primary key,
  photo_id uuid references photos(id) on delete cascade not null,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  selected_at timestamp with time zone default now(),
  notes text,
  constraint unique_photo_reviewer unique(photo_id, reviewer_id)
);

create index idx_photo_selections_photo on photo_selections(photo_id);
create index idx_photo_selections_reviewer on photo_selections(reviewer_id);

-- Enable RLS
alter table photo_selections enable row level security;

-- Reviewers manage their own selections
create policy "Reviewers can manage own selections"
  on photo_selections for all
  using (reviewer_id = auth.uid());

-- Owners can view selections for their galleries
create policy "Owners can view selections"
  on photo_selections for select
  using (exists (
    select 1 from photos
    join galleries on galleries.id = photos.gallery_id
    where photos.id = photo_selections.photo_id
    and galleries.owner_id = auth.uid()
  ));