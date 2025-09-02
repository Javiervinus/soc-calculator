'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { getChartColors } from '@/lib/chart-colors';
import { useBatteryProfile } from '@/lib/hooks/use-battery-profile';
import { useConsumptionSegments } from '@/lib/hooks/use-consumption-segments';
import { useUserPreferences } from '@/lib/hooks/use-user-preferences';

export function BatteryChart() {
  const { theme, appTheme } = useUserPreferences();
  const { voltageSOCPoints, isLoading: profileLoading } = useBatteryProfile();
  const { segments, isLoading: segmentsLoading } = useConsumptionSegments();
  const colors = getChartColors(theme as 'light' | 'dark', appTheme);
  
  const isLoading = profileLoading || segmentsLoading;
  
  // Si está cargando, mostrar loader
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }
  
  // Si no hay datos, mostrar mensaje
  if (!voltageSOCPoints || voltageSOCPoints.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center text-muted-foreground">
          No hay datos de voltaje disponibles
        </div>
      </Card>
    );
  }

  // Preparar datos de voltaje - filtrar cada 5 puntos para no sobrecargar el gráfico
  const voltageData = voltageSOCPoints
    .filter((_, index) => index % 5 === 0)
    .map(point => ({
      voltage: point.voltage.toFixed(2),
      soc: point.soc,
    }));

  // Preparar datos de consumo
  const consumptionData = segments.map(segment => {
    const hours = segment.end_hour > segment.start_hour 
      ? segment.end_hour - segment.start_hour 
      : (24 - segment.start_hour) + segment.end_hour;
    
    const periodLabel = segment.period_label || 
      `${String(segment.start_hour).padStart(2, '0')}:00-${String(segment.end_hour).padStart(2, '0')}:00`;
    
    return {
      period: `${periodLabel} (${segment.name})`,
      watts: segment.watts,
      hours: hours,
      totalWh: segment.watts * hours,
    };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; unit?: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: colors.tooltip.bg, border: `1px solid ${colors.tooltip.border}` }} className="p-3 rounded-lg shadow-lg">
          <p className="font-semibold" style={{ color: colors.tooltip.text }}>{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color as string }}>
              {entry.name}: {entry.value.toFixed(1)} {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <Tabs defaultValue="voltage" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Visualización de Datos</h2>
          <TabsList className="grid w-fit grid-cols-3 bg-muted">
            <TabsTrigger value="voltage" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Voltaje</span>
            </TabsTrigger>
            <TabsTrigger value="consumption" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Consumo</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Energía</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="voltage" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Curva de voltaje vs estado de carga
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={voltageData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="voltage" 
                label={{ value: 'Voltaje (V)', position: 'insideBottom', offset: -5, fill: colors.text }}
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <YAxis 
                label={{ value: 'SOC (%)', angle: -90, position: 'insideLeft', fill: colors.text }}
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Line 
                type="monotone" 
                dataKey="soc" 
                stroke={colors.chart1} 
                strokeWidth={2}
                name="Estado de Carga"
                dot={{ fill: colors.chart1, r: 3 }}
                activeDot={{ r: 5, fill: colors.chart1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Consumo por período nocturno
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <YAxis 
                label={{ value: 'Potencia (W)', angle: -90, position: 'insideLeft', fill: colors.text }}
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Bar 
                dataKey="watts" 
                fill={colors.chart2} 
                name="Consumo"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            Energía total consumida por período
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={consumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} opacity={0.3} />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <YAxis 
                label={{ value: 'Energía (Wh)', angle: -90, position: 'insideLeft', fill: colors.text }}
                tick={{ fontSize: 12, fill: colors.text }}
                stroke={colors.text}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: colors.text }} />
              <Area 
                type="monotone" 
                dataKey="totalWh" 
                stroke={colors.chart4} 
                fill={colors.chart4}
                fillOpacity={0.3}
                strokeWidth={2}
                name="Energía Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
}