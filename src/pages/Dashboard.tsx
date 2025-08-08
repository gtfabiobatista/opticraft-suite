import { BarChart3, Image, HardDrive, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useProcessingHistory } from '@/hooks/useProcessingHistory';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
// Dados agora derivados do histórico real


const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard — Otimizador de Imagens';
  }, []);

  const { allHistory, getHistoryStats } = useProcessingHistory();
  const stats = getHistoryStats();

  const monthlyLimit = 50000; // limite padrão do plano
  const now = new Date();

  const monthlyUsage = useMemo(() => {
    return allHistory.filter((e) => {
      const d = new Date(e.processedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [allHistory]);

  const usagePercentage = (monthlyUsage / monthlyLimit) * 100;

  const dailyUsage = useMemo(() => {
    const days = 7;
    const arr: { date: string; count: number; bytesSaved: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const entries = allHistory.filter((e) => {
        const d = new Date(e.processedAt);
        return d.toISOString().slice(0, 10) === key && e.status === 'success';
      });
      const count = entries.length;
      const bytesSaved = entries.reduce(
        (sum, e) => sum + (e.originalSize - e.optimizedSize),
        0
      );
      arr.push({ date: key, count, bytesSaved });
    }
    return arr;
  }, [allHistory]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const recent = useMemo(() => {
    return [...allHistory]
      .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())
      .slice(0, 5);
  }, [allHistory]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h atrás`;
    const days = Math.floor(hours / 24);
    return `${days} d atrás`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitore o desempenho e uso da otimização de imagens
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/optimize">
              <Image className="mr-2 h-4 w-4" />
              Otimizar Imagem
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/batch">
              <Zap className="mr-2 h-4 w-4" />
              Proc. em Lote
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Imagens Processadas"
          value={stats.totalProcessed.toLocaleString()}
          icon={<Image className="h-4 w-4" />}
        />
        <StatsCard
          title="Dados Economizados"
          value={formatBytes(stats.totalSaved)}
          icon={<HardDrive className="h-4 w-4" />}
        />
        <StatsCard
          title="Taxa de Sucesso"
          value={`${stats.successRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatsCard
          title="Requisições da API"
          value={monthlyUsage.toLocaleString()}
          description={`de ${monthlyLimit.toLocaleString()} este mês`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      {/* Usage Limit Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Uso Mensal</CardTitle>
            <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">
              Plano Pro
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {monthlyUsage.toLocaleString()} / {monthlyLimit.toLocaleString()} requests
              </span>
              <span className="font-medium">
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Reinicia no dia 1º de cada mês. 
              <Button variant="link" className="p-0 h-auto text-xs text-primary">
                Atualizar plano
              </Button>
              {' '}para limites maiores.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Usage Chart */}
        <div className="lg:col-span-2">
          <UsageChart data={dailyUsage} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
            )}
            {recent.map((entry) => {
              const isSuccess = entry.status === 'success';
              const saved = isSuccess ? entry.originalSize - entry.optimizedSize : 0;
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${isSuccess ? 'bg-success' : 'bg-destructive'}`} />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[220px]">{entry.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {isSuccess ? `Economia: ${formatBytes(saved)}` : 'Falha na otimização'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{timeAgo(entry.processedAt)}</p>
                    <Badge 
                      variant={isSuccess ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {isSuccess ? 'Concluído' : 'Erro'}
                    </Badge>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/history">
                Ver Todo o Histórico
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/optimize">
                <Image className="h-6 w-6" />
                <span>Otimizar Imagem</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/batch">
                <Zap className="h-6 w-6" />
                <span>Proc. em Lote</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link to="/api-keys">
                <TrendingUp className="h-6 w-6" />
                <span>Gerenciar Chaves API</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;