import React, { useState } from 'react';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { 
  History, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Calendar,
  FileImage,
  HardDrive,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
  const {
    history,
    filters,
    setFilters,
    removeFromHistory,
    clearHistory,
    getHistoryStats,
    exportHistory,
  } = useProcessingHistory();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const stats = getHistoryStats();
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateSavings = (original: number, optimized: number): string => {
    if (original === 0) return '0%';
    return (((original - optimized) / original) * 100).toFixed(1) + '%';
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleDownload = (downloadUrl?: string, fileName?: string) => {
    if (!downloadUrl || !fileName) return;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-8 w-8" />
            Histórico de Processamento
          </h1>
          <p className="text-muted-foreground">
            Acompanhe todas as otimizações realizadas e seus resultados
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportHistory}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={history.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação removerá permanentemente todo o histórico de processamento.
                  Esta operação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Limpar Histórico
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Processado"
          value={stats.totalProcessed.toLocaleString()}
          icon={<FileImage className="h-4 w-4" />}
          description="imagens otimizadas"
        />
        <StatsCard
          title="Dados Economizados"
          value={formatFileSize(stats.totalSaved)}
          icon={<HardDrive className="h-4 w-4" />}
          trend={{
            value: stats.averageSavings,
            label: 'economia média',
            isPositive: true,
          }}
        />
        <StatsCard
          title="Taxa de Sucesso"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          description="processamentos bem-sucedidos"
        />
        <StatsCard
          title="Formato Mais Usado"
          value={Object.keys(stats.formatDistribution).reduce((a, b) => 
            stats.formatDistribution[a] > stats.formatDistribution[b] ? a : b, 'N/A'
          ).toUpperCase()}
          icon={<TrendingUp className="h-4 w-4" />}
          description="formato de saída"
        />
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar arquivo</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Nome do arquivo..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="batch">Lote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setFilters({
                      dateRange: 'all',
                      status: 'all',
                      type: 'all',
                      search: '',
                    })}
                    className="w-full"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados ({history.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileImage className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Nenhum histórico encontrado</p>
                  <p className="text-sm">As otimizações aparecerão aqui conforme você processar imagens</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Tamanhos</TableHead>
                        <TableHead>Formato</TableHead>
                        <TableHead>Economia</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="font-medium">{entry.fileName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(entry.originalSize)} → {formatFileSize(entry.optimizedSize)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.format.toUpperCase()}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              Q: {entry.quality}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-success">
                              {calculateSavings(entry.originalSize, entry.optimizedSize)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={entry.status === 'success' ? 'default' : 'destructive'}
                              className="flex items-center gap-1 w-fit"
                            >
                              {entry.status === 'success' ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {entry.status === 'success' ? 'Sucesso' : 'Erro'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(entry.processedAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {entry.downloadUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(entry.downloadUrl, entry.fileName)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover do histórico?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Remover "{entry.fileName}" do histórico de processamento?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeFromHistory(entry.id)}>
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {/* Format Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Formato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.formatDistribution).map(([format, count]) => (
                  <div key={format} className="flex items-center justify-between">
                    <span className="font-medium">{format.toUpperCase()}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${(count / stats.totalProcessed) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[3ch]">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryPage;