import { useState } from 'react';
import { Layers, Play, Pause, Download, Trash2, Settings } from 'lucide-react';
import { Dropzone } from '@/components/upload/Dropzone';
import { SettingsPanel } from '@/components/optimize/SettingsPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useImageOptimizer } from '@/hooks/useImageOptimizer';
import { OptimizationSettings, OptimizationPreset } from '@/types/apiTypes';

const defaultPresets: OptimizationPreset[] = [
  {
    id: '1',
    name: 'E-commerce',
    description: 'Balanced quality and size for product images',
    settings: { quality: 85, format: 'webp', maintainAspectRatio: true },
    isDefault: true,
  },
  {
    id: '2',
    name: 'Social Media',
    description: 'Optimized for social platforms',
    settings: { quality: 75, format: 'webp', width: 1200, maintainAspectRatio: true },
  },
  {
    id: '3',
    name: 'Web Thumbnails',
    description: 'Small, fast-loading thumbnails',
    settings: { quality: 70, format: 'webp', width: 300, height: 300, maintainAspectRatio: false },
  },
];

const BatchPage = () => {
  const { images, addImages, removeImage, optimizeBatch, isProcessing, clearCompleted } = useImageOptimizer();
  const [selectedPreset, setSelectedPreset] = useState<OptimizationPreset>(defaultPresets[0]);
  const [customSettings, setCustomSettings] = useState<OptimizationSettings>(defaultPresets[0].settings);
  const [presets, setPresets] = useState<OptimizationPreset[]>(defaultPresets);
  const [useCustomSettings, setUseCustomSettings] = useState(false);

  const handleFilesAdded = (files: File[]) => {
    addImages(files);
  };

  const handleStartBatch = () => {
    const pendingImageIds = images
      .filter(img => img.status === 'pending')
      .map(img => img.id);
    
    const settings = useCustomSettings ? customSettings : selectedPreset.settings;
    optimizeBatch(pendingImageIds, settings);
  };

  const handlePresetSave = (name: string, settings: OptimizationSettings) => {
    const newPreset: OptimizationPreset = {
      id: crypto.randomUUID(),
      name,
      description: 'Custom preset',
      settings,
    };
    setPresets(prev => [...prev, newPreset]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusCounts = () => {
    return {
      pending: images.filter(img => img.status === 'pending').length,
      processing: images.filter(img => img.status === 'processing').length,
      completed: images.filter(img => img.status === 'completed').length,
      error: images.filter(img => img.status === 'error').length,
    };
  };

  const getOverallProgress = () => {
    const total = images.length;
    if (total === 0) return 0;
    const completed = images.filter(img => img.status === 'completed' || img.status === 'error').length;
    return (completed / total) * 100;
  };

  const statusCounts = getStatusCounts();
  const progress = getOverallProgress();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Batch Processing</h1>
          <p className="text-muted-foreground">
            Upload multiple images and optimize them with predefined presets
          </p>
        </div>
        <div className="flex gap-3">
          {statusCounts.completed > 0 && (
            <Button variant="outline" onClick={clearCompleted}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Completed
            </Button>
          )}
          {statusCounts.pending > 0 && (
            <Button 
              onClick={handleStartBatch} 
              disabled={isProcessing}
              className="bg-gradient-primary"
            >
              {isProcessing ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Batch ({statusCounts.pending})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <Badge variant="outline" className="w-full justify-center">
                    {statusCounts.pending} Pending
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="w-full justify-center bg-warning/10 text-warning border-warning">
                    {statusCounts.processing} Processing
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="w-full justify-center bg-success/10 text-success border-success">
                    {statusCounts.completed} Completed
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="w-full justify-center bg-destructive/10 text-destructive border-destructive">
                    {statusCounts.error} Failed
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload and Presets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Area */}
          <Dropzone
            onFilesAdded={handleFilesAdded}
            maxFiles={100}
            className="h-40"
          />

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Optimization Presets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      !useCustomSettings && selectedPreset.id === preset.id
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedPreset(preset);
                      setUseCustomSettings(false);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{preset.name}</h4>
                      {preset.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Quality:</span>
                        <span>{preset.settings.quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="uppercase">{preset.settings.format}</span>
                      </div>
                      {preset.settings.width && (
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{preset.settings.width}x{preset.settings.height || 'auto'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Custom Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Use your own optimization parameters
                  </p>
                </div>
                <Button
                  variant={useCustomSettings ? "default" : "outline"}
                  onClick={() => setUseCustomSettings(!useCustomSettings)}
                >
                  {useCustomSettings ? 'Using Custom' : 'Use Custom'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Images Table */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Images Queue ({images.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={image.preview}
                          alt={image.file.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium truncate max-w-48">
                            {image.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(image.originalSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={
                            image.status === 'completed' ? 'bg-success/10 text-success border-success' :
                            image.status === 'processing' ? 'bg-warning/10 text-warning border-warning' :
                            image.status === 'error' ? 'bg-destructive/10 text-destructive border-destructive' :
                            ''
                          }
                        >
                          {image.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImage(image.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div>
          {useCustomSettings ? (
            <SettingsPanel
              settings={customSettings}
              onSettingsChange={setCustomSettings}
              onPresetSave={handlePresetSave}
              className="sticky top-6"
            />
          ) : (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Selected Preset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">{selectedPreset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPreset.description}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quality:</span>
                      <span className="font-medium">{selectedPreset.settings.quality}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium uppercase">{selectedPreset.settings.format}</span>
                    </div>
                    {selectedPreset.settings.width && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="font-medium">
                          {selectedPreset.settings.width}×{selectedPreset.settings.height || 'auto'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio:</span>
                      <span className="font-medium">
                        {selectedPreset.settings.maintainAspectRatio ? 'Locked' : 'Free'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setUseCustomSettings(true)}
                  >
                    Customize Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPage;