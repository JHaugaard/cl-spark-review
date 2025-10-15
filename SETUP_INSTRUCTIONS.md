# Phase 1 Setup Instructions

## 1. Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

## 2. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create app_role enum
create type public.app_role as enum ('owner', 'reviewer');

-- Create profiles table (no role column here for security)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create user_roles table (separate and secure)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Users can read their own roles
create policy "Users can read own roles"
  on user_roles for select
  using (auth.uid() = user_id);

-- Only owners can manage roles (for admin panel later)
create policy "Owners can manage roles"
  on user_roles for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'owner'
    )
  );

-- Security definer function to check role (prevents RLS recursion)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Helper function to get user role
create or replace function public.get_user_role(_user_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_roles
  where user_id = _user_id
  limit 1
$$;

-- Create invitation_tokens table (for Phase 2)
create table public.invitation_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  email text not null,
  full_name text not null,
  created_by uuid references auth.users(id) not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.invitation_tokens enable row level security;

-- Only owners can create tokens
create policy "Owners can create tokens"
  on invitation_tokens for insert
  with check (public.has_role(auth.uid(), 'owner'));

-- Anyone can read by token for signup (needed for public signup flow)
create policy "Anyone can read by token"
  on invitation_tokens for select
  using (true);

-- Auto-create profile and assign default reviewer role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Create profile
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Assign default 'reviewer' role
  insert into public.user_roles (user_id, role)
  values (new.id, 'reviewer');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 3. Create Your First Owner Account

1. Sign up for an account using the app's login page
2. After signing up, run this SQL in Supabase SQL Editor (replace with your email):

```sql
update user_roles
set role = 'owner'
where user_id = (
  select id 
  from auth.users 
  where email = 'your-email@example.com'
);
```

3. Verify it worked:

```sql
select u.email, ur.role 
from auth.users u 
join user_roles ur on ur.user_id = u.id 
where u.email = 'your-email@example.com';
```

## 4. Configure Email Settings (Optional)

For password reset to work properly, you may want to:

1. Go to Authentication > Email Templates in Supabase
2. Customize the "Reset Password" email template
3. Or configure custom SMTP in Authentication > Settings

Default Supabase emails will work for testing.

## 5. Disable Email Confirmation (Optional, for faster testing)

1. Go to Authentication > Settings in Supabase
2. Disable "Enable email confirmations"
3. This allows users to log in immediately after signup without email verification

## Features Implemented

✅ Secure authentication with email/password
✅ Password reset flow
✅ Role-based access (owner/reviewer) in separate table
✅ Protected routes
✅ Clean, Notion-inspired UI
✅ Responsive design
✅ User profile display with role in header
✅ Sign out functionality

## Security Features

🔒 Roles stored in separate `user_roles` table (prevents privilege escalation)
🔒 Security definer functions for role checks (prevents RLS recursion)
🔒 Row Level Security policies on all tables
🔒 Auth state managed with both user and session objects
🔒 Proper email redirect URLs for password reset

## Next Steps

Ready for Phase 2! The foundation is now in place for:
- Gallery management
- Invitation system (tables already created)
- Photo uploads
- Review workflows
