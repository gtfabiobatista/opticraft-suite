import { useState, useCallback } from 'react';
import { ImageFile, OptimizationSettings } from '@/types/apiTypes';
import { toast } from '@/hooks/use-toast';

export const useImageOptimizer = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addImages = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      originalSize: file.size,
    }));

    setImages(prev => [...prev, ...newImages]);
    return newImages;
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const optimizeImage = useCallback(async (
    imageId: string, 
    settings: OptimizationSettings
  ) => {
    setImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'processing' as const }
          : img
      )
    );

    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful optimization
      const mockOptimizedSize = Math.floor(Math.random() * 0.7 * 1000000);
      
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'completed' as const,
                optimizedSize: mockOptimizedSize,
                downloadUrl: `https://cdn.example.com/optimized/${imageId}`
              }
            : img
        )
      );

      toast({
        title: "Image optimized successfully",
        description: `Saved ${((1000000 - mockOptimizedSize) / 1000000 * 100).toFixed(1)}% in file size`,
      });
    } catch (error) {
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'error' as const, 
                error: 'Optimization failed'
              }
            : img
        )
      );

      toast({
        title: "Optimization failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  }, []);

  const optimizeBatch = useCallback(async (
    imageIds: string[], 
    settings: OptimizationSettings
  ) => {
    setIsProcessing(true);
    
    try {
      // Process images in parallel with some delay for demo
      const promises = imageIds.map((id, index) => 
        new Promise(resolve => 
          setTimeout(() => optimizeImage(id, settings).then(resolve), index * 500)
        )
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Batch processing completed",
        description: `Optimized ${imageIds.length} images successfully`,
      });
    } catch (error) {
      toast({
        title: "Batch processing failed",
        description: "Some images may not have been processed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [optimizeImage]);

  const clearCompleted = useCallback(() => {
    setImages(prev => {
      const completed = prev.filter(img => img.status === 'completed');
      completed.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      return prev.filter(img => img.status !== 'completed');
    });
  }, []);

  return {
    images,
    isProcessing,
    addImages,
    removeImage,
    optimizeImage,
    optimizeBatch,
    clearCompleted,
  };
};