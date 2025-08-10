'use client';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { useBatteryStore } from '@/lib/store';

export function BatteryChart() {
  const { getCurrentProfile } = useBatteryStore();
  const profile = getCurrentProfile();

  const voltageData = profile.voltageSOCTable
    .filter((_, index) => index % 5 === 0)
    .map(entry => ({
      voltage: entry.voltage.toFixed(2),
      soc: entry.soc,
    }));

  const consumptionData = profile.consumptionProfile.map(period => ({
    period: period.label,
    watts: period.watts,
    hours: period.endHour > period.startHour 
      ? period.endHour - period.startHour 
      : (24 - period.startHour) + period.endHour,
    totalWh: period.watts * (period.endHour > period.startHour 
      ? period.endHour - period.startHour 
      : (24 - period.startHour) + period.endHour),
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number; unit?: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
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
    <Card className="p-6">
      <Tabs defaultValue="voltage" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Visualización de Datos</h2>
          <TabsList className="grid w-fit grid-cols-3">
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="voltage" 
                label={{ value: 'Voltaje (V)', position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'SOC (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="soc" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Estado de Carga"
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Potencia (W)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="watts" 
                fill="#10b981" 
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Energía (Wh)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="totalWh" 
                stroke="#8b5cf6" 
                fill="#8b5cf6"
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