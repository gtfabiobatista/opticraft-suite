import { BarChart3, Image, HardDrive, Clock, TrendingUp, Zap } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UsageChart } from '@/components/dashboard/UsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Mock data - replace with real API calls
const mockStats = {
  totalImagesProcessed: 15420,
  totalBytesSaved: 45.2 * 1024 * 1024 * 1024, // 45.2 GB
  averageProcessingTime: 2.3,
  monthlyUsage: 3420,
  monthlyLimit: 50000,
};

const mockDailyUsage = [
  { date: '2024-01-15', count: 120, bytesSaved: 2.1 * 1024 * 1024 * 1024 },
  { date: '2024-01-16', count: 85, bytesSaved: 1.8 * 1024 * 1024 * 1024 },
  { date: '2024-01-17', count: 200, bytesSaved: 3.2 * 1024 * 1024 * 1024 },
  { date: '2024-01-18', count: 150, bytesSaved: 2.7 * 1024 * 1024 * 1024 },
  { date: '2024-01-19', count: 180, bytesSaved: 3.1 * 1024 * 1024 * 1024 },
  { date: '2024-01-20', count: 220, bytesSaved: 4.2 * 1024 * 1024 * 1024 },
  { date: '2024-01-21', count: 95, bytesSaved: 1.5 * 1024 * 1024 * 1024 },
];

const recentActivity = [
  { id: 1, type: 'batch', count: 25, time: '2 minutes ago', status: 'completed' },
  { id: 2, type: 'single', count: 1, time: '15 minutes ago', status: 'completed' },
  { id: 3, type: 'batch', count: 50, time: '1 hour ago', status: 'completed' },
  { id: 4, type: 'single', count: 1, time: '2 hours ago', status: 'failed' },
];

const Dashboard = () => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usagePercentage = (mockStats.monthlyUsage / mockStats.monthlyLimit) * 100;

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
          value={mockStats.totalImagesProcessed.toLocaleString()}
          icon={<Image className="h-4 w-4" />}
          trend={{
            value: 12.5,
            label: 'vs mês passado',
            isPositive: true,
          }}
        />
        <StatsCard
          title="Dados Economizados"
          value={formatBytes(mockStats.totalBytesSaved)}
          icon={<HardDrive className="h-4 w-4" />}
          trend={{
            value: 8.3,
            label: 'vs mês passado',
            isPositive: true,
          }}
        />
        <StatsCard
          title="Tempo Médio de Proc."
          value={`${mockStats.averageProcessingTime}s`}
          icon={<Clock className="h-4 w-4" />}
          trend={{
            value: -15.2,
            label: 'vs mês passado',
            isPositive: true,
          }}
        />
        <StatsCard
          title="Requisições da API"
          value={mockStats.monthlyUsage.toLocaleString()}
          description={`de ${mockStats.monthlyLimit.toLocaleString()} este mês`}
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
                {mockStats.monthlyUsage.toLocaleString()} / {mockStats.monthlyLimit.toLocaleString()} requests
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
          <UsageChart data={mockDailyUsage} />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-success' : 'bg-destructive'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.type === 'batch' ? 'Processamento em lote' : 'Imagem individual'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.count} imagem{activity.count !== 1 ? 'ns' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
            
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