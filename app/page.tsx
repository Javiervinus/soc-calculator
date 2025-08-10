'use client';

import { VoltageInput } from '@/components/voltage-input';
import { SOCDisplay } from '@/components/soc-display';
import { NightProjection } from '@/components/night-projection';
import { BatteryChart } from '@/components/battery-chart';
import { ConsumptionSummary } from '@/components/consumption-summary';
import { SettingsPanel } from '@/components/settings-panel';
import { ResetData } from '@/components/reset-data';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Battery, Moon, BarChart3 } from 'lucide-react';

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <ResetData />
      {/* Compact Header for Mobile */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Battery className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">SOC Calculator</h1>
                <p className="text-[10px] text-slate-500 -mt-0.5">LiFePO₄ 12.8V</p>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              108 Ah | 1380 Wh
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-3 max-w-md mx-auto pb-20">
        {/* Critical Info Section - Always Visible */}
        <div className="space-y-3">
          {/* Voltage Input - Compact */}
          <div className="bg-white rounded-xl shadow-sm">
            <VoltageInput />
          </div>

          {/* SOC Display - Compact with key metrics */}
          <div className="bg-white rounded-xl shadow-sm">
            <SOCDisplay />
          </div>

          {/* Night Projection - Most Important */}
          <div className="bg-white rounded-xl shadow-sm">
            <NightProjection />
          </div>
        </div>

        {/* Tabbed Secondary Content */}
        <div className="mt-4">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Moon className="h-3 w-3 mr-1" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <BarChart3 className="h-3 w-3 mr-1" />
                Gráficos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="mt-3">
              <div className="bg-white rounded-xl shadow-sm">
                <ConsumptionSummary />
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="mt-3">
              <div className="bg-white rounded-xl shadow-sm">
                <BatteryChart />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Settings FAB */}
      <SettingsPanel />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}