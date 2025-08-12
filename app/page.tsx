'use client';

import { BatteryChart } from '@/components/battery-chart';
import { ConsumptionSummary } from '@/components/consumption-summary';
import { NightProjection } from '@/components/night-projection';
import { ResetData } from '@/components/reset-data';
import { SettingsPanel } from '@/components/settings-panel';
import { SOCDisplay } from '@/components/soc-display';
import { SOCHistoryChart } from '@/components/soc-history-chart';
import { SOCTimeReminder } from '@/components/soc-time-reminder';
import { Toaster } from '@/components/ui/sonner';
import { VoltageInput } from '@/components/voltage-input';
import { Battery } from 'lucide-react';
import { HippieOptimized } from '@/components/hippie-optimized';

export default function Home() {

  return (
    <div className="min-h-screen">
      <HippieOptimized />
      <ResetData />
      {/* Compact Header for Mobile */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Battery className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground">Calculadora SOC</h1>
                <p className="text-[10px] sm:text-sm text-muted-foreground -mt-0.5">LiFePO₄ 12.8V</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              108 Ah | 1380 Wh
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 py-3 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Time Reminder Alert */}
          <div className="mb-4">
            <SOCTimeReminder />
          </div>

          {/* Single column for mobile and tablet, 2 columns for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            
            {/* Primary Section - Always first */}
            <div className="space-y-4">
              {/* Voltage Input */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <VoltageInput />
              </div>

              {/* SOC Display */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <SOCDisplay />
              </div>

              {/* Night Projection - Main component */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <NightProjection />
              </div>
            </div>

            {/* Secondary Section */}
            <div className="space-y-4">
              {/* Consumption Summary */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <ConsumptionSummary />
              </div>

              {/* SOC History Chart */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
                <SOCHistoryChart />
              </div>
              {/* Battery Chart */}
              <div className="bg-card rounded-xl shadow-sm border border-border">
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