import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InvitationToken } from '@/lib/supabase-types';
import { InviteGuestInput, GuestSignupInput } from '@/lib/gallery-types';
import { toast } from 'sonner';

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InviteGuestInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate crypto-secure token
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { data, error } = await supabase
        .from('invitation_tokens')
        .insert({
          token,
          email: input.email,
          full_name: input.full_name,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as InvitationToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invitation');
    },
  });
};

export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitation_tokens')
        .select('*')
        .is('used_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvitationToken[];
    },
  });
};

export const useValidateToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['validate-token', token],
    queryFn: async () => {
      if (!token) throw new Error('Token is required');

      const { data, error } = await supabase
        .from('invitation_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid invitation token');
        }
        throw error;
      }

      // Check if token is used
      if (data.used_at) {
        throw new Error('This invitation has already been used');
      }

      // Check if token is expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This invitation has expired');
      }

      return data as InvitationToken;
    },
    enabled: !!token,
    retry: false,
  });
};

export const useSignupWithToken = () => {
  return useMutation({
    mutationFn: async ({
      token,
      password,
      tokenData,
    }: {
      token: string;
      password: string;
      tokenData: InvitationToken;
    }) => {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: tokenData.email,
        password,
        options: {
          data: {
            full_name: tokenData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/galleries`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user');

      // Mark token as used
      const { error: updateError } = await supabase
        .from('invitation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      if (updateError) {
        console.error('Failed to mark token as used:', updateError);
      }

      return authData;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Redirecting...');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create account');
    },
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from('invitation_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitation revoked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke invitation');
    },
  });
};
