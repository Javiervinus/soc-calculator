"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsumptionEditorNew } from "./consumption-editor-new";
import { BatteryConfigTab } from "./settings/battery-config-tab";
import { SOCHistoryTab } from "./settings/soc-history-tab";

interface SettingsPanelProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function SettingsPanelNew({ isOpen, setIsOpen }: SettingsPanelProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configuración</SheetTitle>
          <SheetDescription>
            Ajusta los parámetros del sistema de batería
          </SheetDescription>
        </SheetHeader>

        {/* Panel de Backup comentado por ahora
        <div className="mt-4 px-6">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                ...
              </div>
            </summary>
          </details>
        </div>
        */}

        <Tabs defaultValue="battery" className="mt-4 px-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full bg-muted !text-xs gap-1 p-1 h-auto">
            <TabsTrigger
              value="battery"
              className="data-[state=active]:bg-background"
            >
              Batería
            </TabsTrigger>
            <TabsTrigger
              value="consumption"
              className="data-[state=active]:bg-background"
            >
              Consumo
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-background"
            >
              Histórico
            </TabsTrigger>
            {/* <TabsTrigger value="table" className="data-[state=active]:bg-background">Tabla</TabsTrigger>
            <TabsTrigger value="profiles" className="data-[state=active]:bg-background">Perfiles</TabsTrigger> */}
          </TabsList>

          <TabsContent value="battery" className="space-y-6 mb-10">
            <BatteryConfigTab />
          </TabsContent>

          <TabsContent value="consumption" className="space-y-4">
            <ConsumptionEditorNew />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <SOCHistoryTab />
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              Tabla Voltaje-SOC (pendiente de migración)
            </div>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              Gestión de Perfiles (pendiente de migración)
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
