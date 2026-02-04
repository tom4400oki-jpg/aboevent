-- Allow Admins to View All Profiles
-- NOTE: This requires the 'role' column to be properly set.

-- 1. Create a secure function to check if the invoking user is an admin
-- Using SECURITY DEFINER so it can access the profiles table without recursion issues
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- 2. Add Policy: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING ( public.is_admin() );

-- 3. Update "Users can view own profile" to allow everyone to see basic info?
-- Actually, for now, let's keep it strict. 
-- Regular users see ONLY themselves.
-- Admins see EVERYONE.
