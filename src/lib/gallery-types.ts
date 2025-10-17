import { z } from 'zod';

export interface Gallery {
  id: string;
  name: string;
  description: string | null;
  parent_gallery_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  gallery_id: string;
  filename: string;
  storage_path: string;
  thumbnail_url: string;
  upload_order: number | null;
  uploaded_at: string;
  metadata: any;
}

export interface GalleryAccess {
  id: string;
  gallery_id: string;
  reviewer_id: string;
  granted_at: string;
}

export interface Guest {
  id: string;
  email: string;
  full_name: string | null;
}

export interface GalleryWithDetails extends Gallery {
  photo_count?: number;
  subgallery_count?: number;
  photos?: Photo[];
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  photoId?: string;
}

// Form schemas
export const createGallerySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  parent_gallery_id: z.string().uuid().optional().nullable(),
});

export const editGallerySchema = createGallerySchema;

export const inviteGuestSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name must be less than 100 characters'),
});

export const guestSignupSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type EditGalleryInput = z.infer<typeof editGallerySchema>;

// Photo selection types
export interface PhotoSelection {
  id: string;
  photo_id: string;
  reviewer_id: string;
  selected_at: string;
  notes: string | null;
}

export interface PhotoSelectionWithDetails extends PhotoSelection {
  photos?: Photo & {
    galleries?: Partial<Gallery>;
  };
}

export const photoNotesSchema = z.object({
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type PhotoNotesInput = z.infer<typeof photoNotesSchema>;
export type InviteGuestInput = z.infer<typeof inviteGuestSchema>;
export type GuestSignupInput = z.infer<typeof guestSignupSchema>;
