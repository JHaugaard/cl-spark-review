-- Allow owners to view guest profiles
CREATE POLICY "Owners can view guest profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::app_role) 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = profiles.id 
    AND role = 'reviewer'::app_role
  )
);