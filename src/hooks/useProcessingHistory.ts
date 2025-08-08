import { useState, useEffect, useCallback } from 'react';
import { ProcessingHistory } from '@/types/apiTypes';

const STORAGE_KEY = 'imageOptimizer_processingHistory';

export interface HistoryFilters {
  dateRange: 'today' | 'week' | 'month' | 'all' | 'custom';
  status: 'all' | 'success' | 'error';
  type: 'all' | 'individual' | 'batch';
  search: string;
  startDate?: string;
  endDate?: string;
}

export interface HistoryStats {
  totalProcessed: number;
  totalSaved: number;
  successRate: number;
  averageSavings: number;
  formatDistribution: Record<string, number>;
}

export const useProcessingHistory = () => {
  const [history, setHistory] = useState<ProcessingHistory[]>([]);
  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: 'all',
    status: 'all',
    type: 'all',
    search: '',
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse history from localStorage:', error);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((entry: Omit<ProcessingHistory, 'id' | 'processedAt'>) => {
    const newEntry: ProcessingHistory = {
      ...entry,
      id: crypto.randomUUID(),
      processedAt: new Date().toISOString(),
    };
    
    setHistory(prev => [newEntry, ...prev]);
  }, []);

  const addBatchToHistory = useCallback((entries: Omit<ProcessingHistory, 'id' | 'processedAt'>[]) => {
    const timestamp = new Date().toISOString();
    const newEntries: ProcessingHistory[] = entries.map(entry => ({
      ...entry,
      id: crypto.randomUUID(),
      processedAt: timestamp,
    }));
    
    setHistory(prev => [...newEntries, ...prev]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getFilteredHistory = useCallback(() => {
    let filtered = [...history];

    // Date filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'today':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'custom':
          if (filters.startDate) {
            cutoffDate = new Date(filters.startDate);
            filtered = filtered.filter(entry => {
              const entryDate = new Date(entry.processedAt);
              const endDate = filters.endDate ? new Date(filters.endDate) : now;
              return entryDate >= cutoffDate && entryDate <= endDate;
            });
          }
          return filtered;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(entry => new Date(entry.processedAt) >= cutoffDate);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.fileName.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [history, filters]);

  const getHistoryStats = useCallback((): HistoryStats => {
    const filtered = getFilteredHistory();
    const successful = filtered.filter(entry => entry.status === 'success');
    
    const totalSaved = successful.reduce((sum, entry) => 
      sum + (entry.originalSize - entry.optimizedSize), 0
    );

    const formatDistribution = successful.reduce((acc, entry) => {
      acc[entry.format] = (acc[entry.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageSavings = successful.length > 0 
      ? successful.reduce((sum, entry) => {
          const savings = ((entry.originalSize - entry.optimizedSize) / entry.originalSize) * 100;
          return sum + savings;
        }, 0) / successful.length
      : 0;

    return {
      totalProcessed: filtered.length,
      totalSaved,
      successRate: filtered.length > 0 ? (successful.length / filtered.length) * 100 : 0,
      averageSavings,
      formatDistribution,
    };
  }, [getFilteredHistory]);

  const exportHistory = useCallback(() => {
    const filtered = getFilteredHistory();
    const csvContent = [
      ['Nome do Arquivo', 'Tamanho Original', 'Tamanho Otimizado', 'Formato', 'Qualidade', 'Status', 'Data de Processamento', 'Economia (%)'].join(','),
      ...filtered.map(entry => [
        entry.fileName,
        entry.originalSize,
        entry.optimizedSize,
        entry.format,
        entry.quality,
        entry.status,
        new Date(entry.processedAt).toLocaleString('pt-BR'),
        entry.status === 'success' ? (((entry.originalSize - entry.optimizedSize) / entry.originalSize) * 100).toFixed(2) + '%' : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_otimizacao_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getFilteredHistory]);

  return {
    history: getFilteredHistory(),
    allHistory: history,
    filters,
    setFilters,
    addToHistory,
    addBatchToHistory,
    removeFromHistory,
    clearHistory,
    getHistoryStats,
    exportHistory,
  };
};