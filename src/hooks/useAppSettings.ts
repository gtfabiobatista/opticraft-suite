import { useCallback, useEffect, useMemo, useState } from 'react';
import { OptimizationPreset, OptimizationSettings } from '@/types/apiTypes';

const APP_SETTINGS_KEY = 'imageOptimizer_appSettings';

export interface AppSettings {
  optimizationDefaults: OptimizationSettings;
  presets: OptimizationPreset[];
  monthlyUsageLimit: number;
  planName: string;
  historyRetentionDays: number | null; // null = ilimitado
  ui?: {
    theme?: 'system' | 'light' | 'dark';
  };
}

const factoryPresets: OptimizationPreset[] = [
  {
    id: 'preset-ecommerce',
    name: 'E-commerce',
    description: 'Qualidade balanceada para imagens de produtos',
    settings: { quality: 85, format: 'webp', maintainAspectRatio: true },
    isDefault: true,
  },
  {
    id: 'preset-social',
    name: 'Redes Sociais',
    description: 'Otimizado para plataformas sociais',
    settings: { quality: 75, format: 'webp', width: 1200, maintainAspectRatio: true },
  },
  {
    id: 'preset-thumbs',
    name: 'Miniaturas Web',
    description: 'Miniaturas pequenas e rápidas de carregar',
    settings: { quality: 70, format: 'webp', width: 300, height: 300, maintainAspectRatio: false },
  },
];

const defaultSettings: AppSettings = {
  optimizationDefaults: {
    quality: 80,
    format: 'auto',
    maintainAspectRatio: true,
  },
  presets: factoryPresets,
  monthlyUsageLimit: 50000,
  planName: 'Pro',
  historyRetentionDays: 90,
  ui: { theme: 'system' },
};

function loadInitialSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    // Merge cautiously with defaults to avoid missing keys
    return {
      ...defaultSettings,
      ...parsed,
      optimizationDefaults: { ...defaultSettings.optimizationDefaults, ...(parsed?.optimizationDefaults || {}) },
      presets: Array.isArray(parsed?.presets) && parsed.presets.length > 0 ? parsed.presets : factoryPresets,
      monthlyUsageLimit: typeof parsed?.monthlyUsageLimit === 'number' ? parsed.monthlyUsageLimit : defaultSettings.monthlyUsageLimit,
      planName: typeof parsed?.planName === 'string' ? parsed.planName : defaultSettings.planName,
      historyRetentionDays: typeof parsed?.historyRetentionDays === 'number' ? parsed.historyRetentionDays : defaultSettings.historyRetentionDays,
      ui: { ...defaultSettings.ui, ...(parsed?.ui || {}) },
    } as AppSettings;
  } catch {
    return defaultSettings;
  }
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadInitialSettings());

  // persist
  useEffect(() => {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Derived
  const defaultPreset = useMemo(
    () => settings.presets.find((p) => p.isDefault) || settings.presets[0],
    [settings.presets]
  );

  // Mutators
  const updateOptimizationDefaults = useCallback((next: OptimizationSettings) => {
    setSettings((prev) => ({ ...prev, optimizationDefaults: next }));
  }, []);

  const addPreset = useCallback((name: string, presetSettings: OptimizationSettings) => {
    setSettings((prev) => ({
      ...prev,
      presets: [
        ...prev.presets,
        {
          id: crypto.randomUUID(),
          name,
          description: 'Preset personalizado',
          settings: presetSettings,
        },
      ],
    }));
  }, []);

  const updatePreset = useCallback((id: string, updates: Partial<OptimizationPreset>) => {
    setSettings((prev) => ({
      ...prev,
      presets: prev.presets.map((p) => (p.id === id ? { ...p, ...updates, settings: { ...p.settings, ...(updates as any).settings } } : p)),
    }));
  }, []);

  const deletePreset = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, presets: prev.presets.filter((p) => p.id !== id) }));
  }, []);

  const duplicatePreset = useCallback((id: string) => {
    setSettings((prev) => {
      const base = prev.presets.find((p) => p.id === id);
      if (!base) return prev;
      const copy: OptimizationPreset = {
        ...base,
        id: crypto.randomUUID(),
        name: `${base.name} (cópia)`,
        isDefault: false,
      };
      return { ...prev, presets: [...prev.presets, copy] };
    });
  }, []);

  const setDefaultPreset = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      presets: prev.presets.map((p) => ({ ...p, isDefault: p.id === id })),
    }));
  }, []);

  const resetPresetsToFactory = useCallback(() => {
    setSettings((prev) => ({ ...prev, presets: factoryPresets }));
  }, []);

  const setMonthlyUsageLimit = useCallback((limit: number) => {
    setSettings((prev) => ({ ...prev, monthlyUsageLimit: Math.max(0, Math.floor(limit)) }));
  }, []);

  const setPlanName = useCallback((name: string) => {
    setSettings((prev) => ({ ...prev, planName: name || 'Pro' }));
  }, []);

  const setHistoryRetentionDays = useCallback((days: number | null) => {
    setSettings((prev) => ({ ...prev, historyRetentionDays: days && days > 0 ? Math.floor(days) : null }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  return {
    // state
    optimizationDefaults: settings.optimizationDefaults,
    presets: settings.presets,
    monthlyUsageLimit: settings.monthlyUsageLimit,
    planName: settings.planName,
    historyRetentionDays: settings.historyRetentionDays,
    defaultPreset,

    // actions
    updateOptimizationDefaults,
    addPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    setDefaultPreset,
    resetPresetsToFactory,
    setMonthlyUsageLimit,
    setPlanName,
    setHistoryRetentionDays,
    resetAll,
  };
};