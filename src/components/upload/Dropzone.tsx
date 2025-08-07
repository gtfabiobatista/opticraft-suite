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
        'relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-300 cursor-pointer group overflow-hidden',
        isDragActive && !isDragReject && 'border-primary bg-primary/5 shadow-glow',
        isDragReject && 'border-destructive bg-destructive/5',
        !isDragActive && 'border-border hover:border-primary/50 hover:bg-accent/50',
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-3 h-full min-h-[120px]">
        {/* Upload Icon */}
        <div className={cn(
          'rounded-full p-3 transition-all duration-300',
          isDragActive && !isDragReject && 'bg-primary text-primary-foreground scale-110',
          isDragReject && 'bg-destructive text-destructive-foreground',
          !isDragActive && 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
        )}>
          {isDragReject ? (
            <AlertCircle className="h-6 w-6" />
          ) : (
            <Upload className="h-6 w-6" />
          )}
        </div>

        {/* Text Content */}
        <div className="space-y-1 max-w-full">
          <h3 className="text-base font-semibold text-foreground">
            {isDragActive 
              ? isDragReject 
                ? 'Tipo de arquivo inválido' 
                : 'Solte os arquivos aqui'
              : 'Arraste e solte imagens aqui'
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {isDragReject 
              ? 'Apenas arquivos de imagem são permitidos'
              : (
                <>
                  ou <span className="text-primary font-medium cursor-pointer">procurar arquivos</span> para enviar
                </>
              )
            }
          </p>
        </div>

        {/* File Restrictions - Condensed */}
        <div className="text-xs text-muted-foreground text-center">
          <p>JPEG, PNG, WebP • Max: {formatFileSize(maxSize)} • {maxFiles} arquivos</p>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">Enviando arquivos...</p>
            <Progress value={Math.max(...Object.values(uploadProgress))} className="w-32" />
          </div>
        </div>
      )}
    </div>
  );
};