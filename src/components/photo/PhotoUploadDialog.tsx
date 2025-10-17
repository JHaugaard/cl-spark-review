import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { UploadProgress as UploadProgressType } from '@/lib/gallery-types';
import { validatePhotoFile, formatFileSize } from '@/lib/photo-utils';
import { useUploadPhotos } from '@/hooks/usePhotos';
import { UploadProgress } from './UploadProgress';

interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
}

export const PhotoUploadDialog = ({
  open,
  onOpenChange,
  galleryId,
}: PhotoUploadDialogProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadPhotos = useUploadPhotos();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach((file) => {
      const validation = validatePhotoFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(`Some files were rejected:\n${errors.join('\n')}`);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await uploadPhotos.mutateAsync({
        galleryId,
        files: selectedFiles,
        onProgress: setUploadProgress,
      });

      // Wait a moment to show success state
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress([]);
        setIsUploading(false);
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFiles([]);
      setUploadProgress([]);
      onOpenChange(false);
    }
  };

  const allUploadsComplete = uploadProgress.length > 0 &&
    uploadProgress.every((p) => p.status === 'success' || p.status === 'error');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Upload JPEG photos to this gallery (max 10MB per file)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isUploading && (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">
                {isDragActive
                  ? 'Drop files here...'
                  : 'Drag & drop photos here, or click to select'}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Only JPEG files up to 10MB are accepted
              </p>
            </div>
          )}

          {selectedFiles.length > 0 && !isUploading && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadProgress.length > 0 && (
            <UploadProgress progress={uploadProgress} />
          )}

          <div className="flex justify-end gap-2">
            {!isUploading && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}
                </Button>
              </>
            )}
            {allUploadsComplete && (
              <Button onClick={handleClose}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
