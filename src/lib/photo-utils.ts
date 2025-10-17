const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg'];

export const validatePhotoFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG files are allowed' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}` };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalFilename.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
};

export const getStoragePath = (galleryId: string, photoId: string): string => {
  return `${galleryId}/${photoId}.jpg`;
};

export const getThumbnailUrl = (supabaseUrl: string, projectId: string, storagePath: string): string => {
  return `${supabaseUrl}/storage/v1/object/public/gallery-photos/${storagePath}`;
};
