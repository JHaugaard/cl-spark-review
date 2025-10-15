export type AppRole = 'owner' | 'reviewer';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface InvitationToken {
  id: string;
  token: string;
  email: string;
  full_name: string;
  created_by: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}
