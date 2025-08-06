import { useState, useCallback } from 'react';
import { ImageFile, OptimizationSettings } from '@/types/apiTypes';
import { toast } from '@/hooks/use-toast';
import { optimizeImage as optimizeImageFile, createDownloadUrl } from '@/lib/imageOptimizer';

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
      // Get the original image
      const originalImage = images.find(img => img.id === imageId);
      if (!originalImage) throw new Error('Image not found');

      // Perform real image optimization
      const result = await optimizeImageFile(originalImage.file, settings);
      
      // Create download URL from optimized blob
      const downloadUrl = createDownloadUrl(result.blob);
      
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'completed' as const,
                optimizedSize: result.size,
                downloadUrl: downloadUrl
              }
            : img
        )
      );

      const savingsPercent = ((originalImage.originalSize - result.size) / originalImage.originalSize * 100);
      
      toast({
        title: "Imagem otimizada com sucesso",
        description: `Economizou ${savingsPercent.toFixed(1)}% no tamanho do arquivo (${result.format.toUpperCase()})`,
      });
    } catch (error) {
      console.error('Optimization error:', error);
      setImages(prev => 
        prev.map(img => 
          img.id === imageId 
            ? { 
                ...img, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Optimization failed'
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