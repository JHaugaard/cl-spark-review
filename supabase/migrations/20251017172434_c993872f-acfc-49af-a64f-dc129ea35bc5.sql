-- Allow owners to view reviewer roles for guest management
CREATE POLICY "Owners can view reviewer roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'owner'::app_role)
  AND role = 'reviewer'::app_role
);