import { useState } from 'react';
import { Image, Wand2, Download } from 'lucide-react';
import { Dropzone } from '@/components/upload/Dropzone';
import { ImagePreview } from '@/components/upload/ImagePreview';
import { SettingsPanel } from '@/components/optimize/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useImageOptimizer } from '@/hooks/useImageOptimizer';
import { OptimizationSettings } from '@/types/apiTypes';

const OptimizePage = () => {
  const { images, addImages, removeImage, optimizeImage } = useImageOptimizer();
  const [settings, setSettings] = useState<OptimizationSettings>({
    quality: 80,
    format: 'auto',
    maintainAspectRatio: true,
  });

  const handleFilesAdded = (files: File[]) => {
    addImages(files);
  };

  const handleOptimize = (imageId: string) => {
    optimizeImage(imageId, settings);
  };

  const handleOptimizeAll = () => {
    const pendingImages = images.filter(img => img.status === 'pending');
    pendingImages.forEach(img => optimizeImage(img.id, settings));
  };

  const completedImages = images.filter(img => img.status === 'completed');
  const pendingImages = images.filter(img => img.status === 'pending');

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Single Image Optimization</h1>
          <p className="text-muted-foreground">
            Upload and optimize individual images with custom settings
          </p>
        </div>
        {pendingImages.length > 0 && (
          <Button onClick={handleOptimizeAll} className="bg-gradient-primary">
            <Wand2 className="mr-2 h-4 w-4" />
            Optimize All ({pendingImages.length})
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload and Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          {images.length === 0 && (
            <Dropzone
              onFilesAdded={handleFilesAdded}
              maxFiles={5}
              className="h-64"
            />
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Images ({images.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open file dialog for more uploads
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length > 0) {
                          handleFilesAdded(files);
                        }
                      };
                      input.click();
                    }}
                  >
                    Add More
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {images.map((image) => (
                    <ImagePreview
                      key={image.id}
                      image={image}
                      onRemove={removeImage}
                      onOptimize={handleOptimize}
                    />
                  ))}
                </div>
                
                {/* Add more files area */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Dropzone
                    onFilesAdded={handleFilesAdded}
                    maxFiles={10}
                    className="h-32 border-dashed border-muted-foreground/30 bg-muted/20"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Summary */}
          {completedImages.length > 0 && (
            <Card className="border-success/50 bg-success/5">
              <CardHeader>
                <CardTitle className="text-success">Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {completedImages.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Images Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {(() => {
                        const totalOriginal = completedImages.reduce((sum, img) => sum + img.originalSize, 0);
                        const totalOptimized = completedImages.reduce((sum, img) => sum + (img.optimizedSize || 0), 0);
                        const savings = ((totalOriginal - totalOptimized) / totalOriginal) * 100;
                        return `${savings.toFixed(1)}%`;
                      })()}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Savings</p>
                  </div>
                  <div className="text-center">
                    <Button className="w-full bg-gradient-success text-success-foreground">
                      <Download className="mr-2 h-4 w-4" />
                      Download All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div>
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            className="sticky top-6"
          />
        </div>
      </div>
    </div>
  );
};

export default OptimizePage;