-- Manual script to promote first user to owner role
-- Run this after creating your first user account via the app

-- Replace 'your-email@example.com' with your actual email
-- This will promote that user from 'reviewer' to 'owner'

update user_roles
set role = 'owner'
where user_id = (
  select id 
  from auth.users 
  where email = 'your-email@example.com'
);

-- To verify it worked, run:
-- select u.email, ur.role 
-- from auth.users u 
-- join user_roles ur on ur.user_id = u.id 
-- where u.email = 'your-email@example.com';
