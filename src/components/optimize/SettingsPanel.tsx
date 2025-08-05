import { useState } from 'react';
import { Save, RotateCcw, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { OptimizationSettings } from '@/types/apiTypes';

interface SettingsPanelProps {
  settings: OptimizationSettings;
  onSettingsChange: (settings: OptimizationSettings) => void;
  onPresetSave?: (name: string, settings: OptimizationSettings) => void;
  className?: string;
}

export const SettingsPanel = ({
  settings,
  onSettingsChange,
  onPresetSave,
  className
}: SettingsPanelProps) => {
  const [presetName, setPresetName] = useState('');

  const updateSettings = (updates: Partial<OptimizationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const resetToDefaults = () => {
    const defaultSettings: OptimizationSettings = {
      quality: 80,
      format: 'auto',
      width: undefined,
      height: undefined,
      maintainAspectRatio: true,
    };
    onSettingsChange(defaultSettings);
  };

  const getFormatDescription = (format: string) => {
    const descriptions = {
      webp: 'Modern format with excellent compression',
      avif: 'Next-gen format with best compression',
      jpeg: 'Universal compatibility',
      png: 'Lossless compression',
      auto: 'Automatically choose best format'
    };
    return descriptions[format as keyof typeof descriptions] || '';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return 'Highest';
    if (quality >= 75) return 'High';
    if (quality >= 60) return 'Medium';
    if (quality >= 40) return 'Low';
    return 'Lowest';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Optimization Settings
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="text-xs"
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quality Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality">Image Quality</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getQualityLabel(settings.quality)}
              </Badge>
              <span className="text-sm font-mono">{settings.quality}%</span>
            </div>
          </div>
          <Slider
            id="quality"
            min={10}
            max={100}
            step={5}
            value={[settings.quality]}
            onValueChange={(value) => updateSettings({ quality: value[0] })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality = larger file size
          </p>
        </div>

        <Separator />

        {/* Format Selection */}
        <div className="space-y-3">
          <Label htmlFor="format">Output Format</Label>
          <Select
            value={settings.format}
            onValueChange={(value) => updateSettings({ format: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Recommended)</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
              <SelectItem value="avif">AVIF</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getFormatDescription(settings.format)}
          </p>
        </div>

        <Separator />

        {/* Dimensions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Resize Dimensions</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.maintainAspectRatio}
                onCheckedChange={(checked) => updateSettings({ maintainAspectRatio: checked })}
              />
              <Label className="text-xs">Lock aspect ratio</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm">Width (px)</Label>
              <input
                id="width"
                type="number"
                placeholder="Auto"
                value={settings.width || ''}
                onChange={(e) => updateSettings({ 
                  width: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm">Height (px)</Label>
              <input
                id="height"
                type="number"
                placeholder="Auto"
                value={settings.height || ''}
                onChange={(e) => updateSettings({ 
                  height: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Leave empty for original dimensions
          </p>
        </div>

        {/* Save Preset */}
        {onPresetSave && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label htmlFor="preset-name">Save as Preset</Label>
              <div className="flex gap-2">
                <input
                  id="preset-name"
                  type="text"
                  placeholder="Preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (presetName.trim()) {
                      onPresetSave(presetName.trim(), settings);
                      setPresetName('');
                    }
                  }}
                  disabled={!presetName.trim()}
                >
                  <Save className="mr-2 h-3 w-3" />
                  Save
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};