"use client";

import { BatteryChart } from "@/components/battery-chart";
import { ConsumptionSummary } from "@/components/consumption-summary";
import { HippieOptimized } from "@/components/hippie-optimized";
import { NightProjection } from "@/components/night-projection";
import { SOCDisplay } from "@/components/soc-display";
import { SOCHistoryChart } from "@/components/soc-history-chart";
import { Toaster } from "@/components/ui/sonner";
import { VoltageInput } from "@/components/voltage-input";

export function HomeClient() {
  return (
    <div className="flex-1">
      <HippieOptimized />
      {/* <ResetData /> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Time Reminder Alert */}
          {/* <div className="mb-4">
            <SOCTimeReminder />
          </div> */}

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
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
