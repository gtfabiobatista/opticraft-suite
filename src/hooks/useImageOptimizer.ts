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
      
      // Get the original image for creating a downloadable version
      const originalImage = images.find(img => img.id === imageId);
      if (!originalImage) throw new Error('Image not found');

      // Create a downloadable blob URL from the original file (simulating optimization)
      const downloadUrl = URL.createObjectURL(originalImage.file);
      
      // Simulate successful optimization
      const mockOptimizedSize = Math.floor(originalImage.originalSize * (0.3 + Math.random() * 0.4)); // 30-70% of original size
      
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'completed' as const,
                optimizedSize: mockOptimizedSize,
                downloadUrl: downloadUrl
              }
            : img
        )
      );

      toast({
        title: "Imagem otimizada com sucesso",
        description: `Economizou ${((originalImage.originalSize - mockOptimizedSize) / originalImage.originalSize * 100).toFixed(1)}% no tamanho do arquivo`,
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
        title: "Otimização falhou",
        description: "Tente novamente ou entre em contato com o suporte",
        variant: "destructive",
      });
    }
  }, [images]);

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
        title: "Processamento em lote concluído",
        description: `${imageIds.length} imagens otimizadas com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Processamento em lote falhou",
        description: "Algumas imagens podem não ter sido processadas",
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