'use client';

import { useBatteryStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Database } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
  Area,
  ComposedChart,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SOCHistoryChart() {
  const { getSOCHistory } = useBatteryStore();
  const history = getSOCHistory();

  // Si no hay datos, mostrar mensaje
  if (history.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold">Histórico de SOC</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay datos históricos</p>
            <p className="text-xs mt-1">Comienza a guardar tu SOC diario</p>
          </div>
        </div>
      </Card>
    );
  }

  // Preparar datos para el gráfico
  const chartData = history.map(entry => ({
    date: format(new Date(entry.timestamp), 'dd MMM', { locale: es }),
    fullDate: format(new Date(entry.timestamp), 'dd/MM/yyyy'),
    soc: entry.soc,
    // Agregar indicadores de estado
    status: entry.soc >= 70 ? 'good' : entry.soc >= 40 ? 'medium' : 'low'
  }));

  // Calcular estadísticas
  const avgSOC = Math.round(history.reduce((sum, e) => sum + e.soc, 0) / history.length);
  const minSOC = Math.min(...history.map(e => e.soc));
  const maxSOC = Math.max(...history.map(e => e.soc));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-700">
          <p className="text-xs font-semibold">{data.fullDate}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            SOC: {data.soc}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = 
      payload.status === 'good' ? '#10b981' :
      payload.status === 'medium' ? '#f59e0b' : '#ef4444';
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold">Histórico de SOC</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{history.length} días</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-zinc-800">
          <p className="text-xs text-muted-foreground">Promedio</p>
          <p className="text-sm font-bold text-blue-600">{avgSOC}%</p>
        </div>
        <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-zinc-800">
          <p className="text-xs text-muted-foreground">Máximo</p>
          <p className="text-sm font-bold text-green-600">{maxSOC}%</p>
        </div>
        <div className="text-center p-2 rounded-md bg-slate-50 dark:bg-zinc-800">
          <p className="text-xs text-muted-foreground">Mínimo</p>
          <p className="text-sm font-bold text-orange-600">{minSOC}%</p>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorSOC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10 }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Área de fondo */}
            <Area
              type="monotone"
              dataKey="soc"
              stroke="none"
              fillOpacity={1}
              fill="url(#colorSOC)"
            />
            
            {/* Línea principal */}
            <Line
              type="monotone"
              dataKey="soc"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
            />
            
            {/* Líneas de referencia */}
            <Line
              dataKey={() => 70}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
            <Line
              dataKey={() => 40}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Óptimo (≥70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">Medio (40-70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Bajo (&lt;40%)</span>
        </div>
      </div>
    </Card>
  );
}