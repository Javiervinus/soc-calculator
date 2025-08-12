'use client';

import { useBatteryStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Database } from 'lucide-react';
import { getChartColors } from '@/lib/chart-colors';
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
  const { getSOCHistory, theme, appTheme } = useBatteryStore();
  const history = getSOCHistory();
  const colors = getChartColors(theme, appTheme);

  // Si no hay datos, mostrar mensaje
  if (history.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="text-lg font-semibold">Histórico de SOC</h3>
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
        <div style={{ backgroundColor: colors.tooltip.bg, border: `1px solid ${colors.tooltip.border}` }} className="p-2 rounded-lg shadow-lg">
          <p className="text-xs font-semibold" style={{ color: colors.tooltip.text }}>{data.fullDate}</p>
          <p className="text-xs" style={{ color: colors.chart1 }}>
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
      payload.status === 'good' ? colors.chart2 :
      payload.status === 'medium' ? colors.chart3 : '#ef4444';
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={color}
        stroke={theme === 'dark' ? '#000000' : '#ffffff'}
        strokeWidth={2}
      />
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="text-lg font-semibold">Histórico de SOC</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{history.length} días</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-md bg-muted">
          <p className="text-xs text-muted-foreground">Promedio</p>
          <p className="text-sm font-bold text-blue-600">{avgSOC}%</p>
        </div>
        <div className="text-center p-2 rounded-md bg-muted">
          <p className="text-xs text-muted-foreground">Máximo</p>
          <p className="text-sm font-bold text-green-600">{maxSOC}%</p>
        </div>
        <div className="text-center p-2 rounded-md bg-muted">
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
                <stop offset="5%" stopColor={colors.chart1} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors.chart1} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: colors.text }}
              stroke={colors.text}
            />
            <YAxis 
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: colors.text }}
              stroke={colors.text}
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
              stroke={colors.chart1}
              strokeWidth={2}
              dot={<CustomDot />}
            />
            
            {/* Líneas de referencia */}
            <Line
              dataKey={() => 70}
              stroke={colors.chart2}
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
            <Line
              dataKey={() => 40}
              stroke={colors.chart3}
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
          <div className="w-2 h-2 rounded-full" style={{backgroundColor: colors.chart2}} />
          <span className="text-muted-foreground">Óptimo (≥70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{backgroundColor: colors.chart3}} />
          <span className="text-muted-foreground">Medio (40-70%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ef4444'}} />
          <span className="text-muted-foreground">Bajo (&lt;40%)</span>
        </div>
      </div>
    </Card>
  );
}