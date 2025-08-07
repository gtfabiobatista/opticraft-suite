export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalSize: number;
  optimizedSize?: number;
  error?: string;
  downloadUrl?: string;
  optimizedFilename?: string;
}

export interface OptimizationSettings {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export interface OptimizationPreset {
  id: string;
  name: string;
  description: string;
  settings: OptimizationSettings;
  isDefault?: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: ('read' | 'write' | 'admin')[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
  requestCount: number;
  monthlyLimit: number;
}

export interface UsageStats {
  totalImagesProcessed: number;
  totalBytesSaved: number;
  averageProcessingTime: number;
  monthlyUsage: number;
  monthlyLimit: number;
  dailyUsage: { date: string; count: number; bytesSaved: number }[];
}

export interface ProcessingHistory {
  id: string;
  fileName: string;
  originalSize: number;
  optimizedSize: number;
  format: string;
  quality: number;
  processedAt: string;
  status: 'success' | 'error';
  error?: string;
  downloadUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatar?: string;
  monthlyLimit: number;
}