-- 1. Add role column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Grant admin privileges to the specified user
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tom4400oki@gmail.com';

-- 3. Verify
SELECT * FROM public.profiles WHERE role = 'admin';
