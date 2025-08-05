import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ImageFile } from '@/types/apiTypes';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: string[];
  className?: string;
}

export const Dropzone = ({ 
  onFilesAdded, 
  maxFiles = 10, 
  maxSize = 25 * 1024 * 1024, // 25MB
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  className 
}: DropzoneProps) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          console.error(`File ${file.name}: ${error.message}`);
        });
      });
    }

    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
    multiple: true,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer group',
        isDragActive && !isDragReject && 'border-primary bg-primary/5 shadow-glow',
        isDragReject && 'border-destructive bg-destructive/5',
        !isDragActive && 'border-border hover:border-primary/50 hover:bg-accent/50',
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center space-y-4">
        {/* Upload Icon */}
        <div className={cn(
          'rounded-full p-4 transition-all duration-300',
          isDragActive && !isDragReject && 'bg-primary text-primary-foreground scale-110',
          isDragReject && 'bg-destructive text-destructive-foreground',
          !isDragActive && 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
        )}>
          {isDragReject ? (
            <AlertCircle className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {isDragActive 
              ? isDragReject 
                ? 'Invalid file type' 
                : 'Drop files here'
              : 'Drag & drop images here'
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {isDragReject 
              ? 'Only image files are allowed'
              : (
                <>
                  or <span className="text-primary font-medium">browse files</span> to upload
                </>
              )
            }
          </p>
        </div>

        {/* File Restrictions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported formats: JPEG, PNG, WebP</p>
          <p>Maximum file size: {formatFileSize(maxSize)}</p>
          <p>Maximum files: {maxFiles}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Open file dialog
            }}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            <FileImage className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Uploading files...</p>
            <Progress value={Math.max(...Object.values(uploadProgress))} className="w-32" />
          </div>
        </div>
      )}
    </div>
  );
};