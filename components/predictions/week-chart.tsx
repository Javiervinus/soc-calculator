'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PredictionResult } from '@/lib/solar-predictions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cloud, Sun, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface WeekChartProps {
  predictions: PredictionResult[];
}

export function WeekChart({ predictions }: WeekChartProps) {
  const chartData = predictions.map(p => ({
    date: format(new Date(p.date + 'T12:00:00'), 'EEE d', { locale: es }),
    ah: p.ahEstimated,
    wh: p.whEstimated,
    cloud: p.cloudCoverMedian,
    fullDate: format(new Date(p.date + 'T12:00:00'), 'dd/MM', { locale: es })
  }));

  const getBarColor = (cloudCover: number) => {
    if (cloudCover <= 40) return '#eab308'; // Soleado (amarillo)
    if (cloudCover <= 75) return '#3b82f6'; // Parcialmente nublado (azul)
    return '#6b7280'; // Nublado (gris)
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-xs font-medium">{data.fullDate}</p>
          <p className="text-sm font-bold text-primary">{data.ah} Ah</p>
          <p className="text-xs text-muted-foreground">{data.wh} Wh</p>
          <div className="flex items-center gap-1 text-xs">
            {data.cloud < 50 ? (
              <Sun className="h-3 w-3 text-yellow-500" />
            ) : (
              <Cloud className="h-3 w-3 text-gray-500" />
            )}
            <span>Nubosidad: {data.cloud}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Proyección Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Ah', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ah" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.cloud)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda compacta */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Soleado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Parcial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span>Nublado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}