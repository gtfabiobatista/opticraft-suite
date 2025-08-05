import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UsageChartProps {
  data: {
    date: string;
    count: number;
    bytesSaved: number;
  }[];
}

export const UsageChart = ({ data }: UsageChartProps) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              className="text-muted-foreground"
              fontSize={12}
            />
            <YAxis className="text-muted-foreground" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number, name: string) => [
                name === 'bytesSaved' ? formatBytes(value) : value,
                name === 'bytesSaved' ? 'Bytes Saved' : 'Images Processed'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Images Processed"
              dot={{ fill: 'hsl(var(--primary))' }}
            />
            <Line 
              type="monotone" 
              dataKey="bytesSaved" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              name="Bytes Saved"
              dot={{ fill: 'hsl(var(--success))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};