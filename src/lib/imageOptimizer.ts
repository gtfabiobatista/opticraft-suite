import { OptimizationSettings } from '@/types/apiTypes';

export interface OptimizationResult {
  blob: Blob;
  size: number;
  format: string;
}

export const optimizeImage = async (
  file: File,
  settings: OptimizationSettings
): Promise<OptimizationResult> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate dimensions
        let { width, height } = calculateDimensions(
          img.naturalWidth,
          img.naturalHeight,
          settings
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and resize image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format and quality
        const { mimeType, quality } = getOutputFormat(settings);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                size: blob.size,
                format: settings.format === 'auto' ? 'webp' : settings.format
              });
            } else {
              reject(new Error('Failed to create optimized image'));
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  settings: OptimizationSettings
): { width: number; height: number } => {
  let width = settings.width || originalWidth;
  let height = settings.height || originalHeight;

  // If only one dimension is specified and maintain aspect ratio is true
  if (settings.maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;

    if (settings.width && !settings.height) {
      height = Math.round(settings.width / aspectRatio);
    } else if (settings.height && !settings.width) {
      width = Math.round(settings.height * aspectRatio);
    } else if (settings.width && settings.height) {
      // Both dimensions specified, choose the one that maintains aspect ratio
      const widthRatio = settings.width / originalWidth;
      const heightRatio = settings.height / originalHeight;
      const ratio = Math.min(widthRatio, heightRatio);
      
      width = Math.round(originalWidth * ratio);
      height = Math.round(originalHeight * ratio);
    }
  }

  return { width, height };
};

const getOutputFormat = (settings: OptimizationSettings): { mimeType: string; quality: number } => {
  const quality = settings.quality / 100; // Convert percentage to decimal

  switch (settings.format) {
    case 'jpeg':
      return { mimeType: 'image/jpeg', quality };
    case 'png':
      return { mimeType: 'image/png', quality: 1 }; // PNG doesn't support quality
    case 'webp':
      return { mimeType: 'image/webp', quality };
    case 'avif':
      // Fall back to WebP if AVIF not supported
      return { mimeType: 'image/webp', quality };
    case 'auto':
    default:
      return { mimeType: 'image/webp', quality };
  }
};

export const createDownloadUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};