import { UploadProgress as UploadProgressType } from '@/lib/gallery-types';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: UploadProgressType[];
}

export const UploadProgress = ({ progress }: UploadProgressProps) => {
  const totalFiles = progress.length;
  const completedFiles = progress.filter(
    (p) => p.status === 'success' || p.status === 'error'
  ).length;
  const successFiles = progress.filter((p) => p.status === 'success').length;
  const errorFiles = progress.filter((p) => p.status === 'error').length;

  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">
            Overall Progress: {completedFiles}/{totalFiles}
          </span>
          <span className="text-muted-foreground">
            {successFiles} success, {errorFiles} failed
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {progress.map((item, index) => (
          <div key={index} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                {item.error && (
                  <p className="text-xs text-destructive">{item.error}</p>
                )}
              </div>
              <div className="ml-4 flex items-center">
                {item.status === 'pending' && (
                  <span className="text-xs text-muted-foreground">Waiting...</span>
                )}
                {item.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {item.status === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            {item.status === 'uploading' && (
              <Progress value={item.progress} className="mt-2 h-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
