import { useState } from 'react';
import { X, Download, Eye, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ImageFile } from '@/types/apiTypes';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  onOptimize?: (id: string) => void;
  showOptimizeButton?: boolean;
}

export const ImagePreview = ({ 
  image, 
  onRemove, 
  onOptimize, 
  showOptimizeButton = true 
}: ImagePreviewProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavingsPercentage = (): number => {
    if (!image.optimizedSize || !image.originalSize) return 0;
    return ((image.originalSize - image.optimizedSize) / image.originalSize) * 100;
  };

  const getStatusIcon = () => {
    switch (image.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (image.status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Card className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-elevated',
        image.status === 'processing' && 'animate-pulse'
      )}>
        <CardContent className="p-4">
          {/* Image Thumbnail */}
          <div className="relative mb-3">
            <img
              src={image.preview}
              alt={image.file.name}
              className="h-32 w-full rounded-lg object-cover"
            />
            
            {/* Status Overlay */}
            {image.status === 'processing' && (
              <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Clock className="h-6 w-6 animate-spin text-primary mx-auto" />
                  <p className="text-xs font-medium">Processing...</p>
                </div>
              </div>
            )}

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 text-destructive-foreground hover:bg-destructive"
              onClick={() => onRemove(image.id)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Preview Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate pr-2">
                {image.file.name}
              </p>
              {getStatusIcon()}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(image.originalSize)}</span>
              <Badge variant="outline" className={cn('text-xs', getStatusColor())}>
                {image.status}
              </Badge>
            </div>

            {/* Optimization Results */}
            {image.status === 'completed' && image.optimizedSize && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Optimized:</span>
                  <span className="font-medium text-success">
                    {formatFileSize(image.optimizedSize)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Saved:</span>
                  <span className="font-medium text-success">
                    {getSavingsPercentage().toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={getSavingsPercentage()} 
                  className="h-2"
                />
              </div>
            )}

            {/* Error Message */}
            {image.status === 'error' && image.error && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-destructive">{image.error}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            {image.status === 'pending' && showOptimizeButton && onOptimize && (
              <Button
                size="sm"
                onClick={() => onOptimize(image.id)}
                className="flex-1"
              >
                <Settings className="mr-2 h-3 w-3" />
                Optimize
              </Button>
            )}

            {image.status === 'completed' && image.downloadUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(image.downloadUrl, '_blank')}
                className="flex-1"
              >
                <Download className="mr-2 h-3 w-3" />
                Download
              </Button>
            )}

            {image.status === 'error' && onOptimize && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOptimize(image.id)}
                className="flex-1"
              >
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
            <img
              src={image.preview}
              alt={image.file.name}
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-background/80 hover:bg-background"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};