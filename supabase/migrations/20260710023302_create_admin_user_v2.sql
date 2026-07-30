/*
# Create admin user

Creates an admin user in auth.users and profiles.
Email: admin@punjabkavirsa.com
Password: admin123456
Role: admin

The handle_new_user() trigger auto-creates a profile row when a user is inserted
into auth.users, so we only insert into auth.users and then update the profile role.
*/

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@punjabkavirsa.com',
  crypt('admin123456', gen_salt('bf', 10)),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  '{}'::jsonb,
  '{}'::jsonb
);

-- Update the auto-created profile to admin role
UPDATE profiles SET role = 'admin', full_name = 'Admin User', phone = '+92 300 0000000'
WHERE email = 'admin@punjabkavirsa.com';