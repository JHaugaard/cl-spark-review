import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateTestUserParams {
  email: string;
  password: string;
  full_name: string;
}

export const useCreateTestUser = () => {
  return useMutation({
    mutationFn: async ({ email, password, full_name }: CreateTestUserParams) => {
      const { data, error } = await supabase.functions.invoke('create-test-user', {
        body: { email, password, full_name },
      });

      if (error) throw error;
      return data;
    },
  });
};
