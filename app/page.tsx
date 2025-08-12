'use client';

import { BatteryChart } from '@/components/battery-chart';
import { ConsumptionSummary } from '@/components/consumption-summary';
import { NightProjection } from '@/components/night-projection';
import { ResetData } from '@/components/reset-data';
import { SettingsPanel } from '@/components/settings-panel';
import { SOCDisplay } from '@/components/soc-display';
import { Toaster } from '@/components/ui/sonner';
import { VoltageInput } from '@/components/voltage-input';
import { Battery } from 'lucide-react';

export default function Home() {

  return (
    <div className="min-h-screen">
      <ResetData />
      {/* Compact Header for Mobile */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Battery className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">Calculadora SOC</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">LiFePO₄ 12.8V</p>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              108 Ah | 1380 Wh
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-3 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Single column for mobile and tablet, 2 columns for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Primary Section - Always first */}
            <div className="space-y-4">
              {/* Voltage Input */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm dark:border dark:border-zinc-800">
                <VoltageInput />
              </div>

              {/* SOC Display */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm dark:border dark:border-zinc-800">
                <SOCDisplay />
              </div>

              {/* Night Projection - Main component */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm dark:border dark:border-zinc-800">
                <NightProjection />
              </div>
            </div>

            {/* Secondary Section */}
            <div className="space-y-4">
              {/* Consumption Summary */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm dark:border dark:border-zinc-800">
                <ConsumptionSummary />
              </div>

              {/* Battery Chart */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm dark:border dark:border-zinc-800">
                <BatteryChart />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings FAB */}
      <SettingsPanel />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}