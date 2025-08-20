'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Settings2, ChevronRight, RefreshCw } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface PredictionParamsProps {
  params: {
    etaElec: number;
    etaSoil: number;
    etaCtrl: number;
    etaAOI: number;
    svf: number;
    midStart: number;
    midEnd: number;
  };
  onParamChange: (param: any) => void;
  onRecalculate: () => void;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PredictionParams({
  params,
  onParamChange,
  onRecalculate,
  loading,
  open,
  onOpenChange
}: PredictionParamsProps) {
  const formatValue = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Parámetros de simulación
              </div>
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                open && "rotate-90"
              )} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Vista compacta en 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna 1: Pérdidas */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">Pérdidas del sistema</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Eléctrica</Label>
                    <span className="text-xs font-mono">{formatValue(params.etaElec * 100, 0)}%</span>
                  </div>
                  <Slider
                    value={[params.etaElec * 100]}
                    onValueChange={([v]) => onParamChange({ etaElec: v / 100 })}
                    min={85}
                    max={95}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Suciedad</Label>
                    <span className="text-xs font-mono">{formatValue(params.etaSoil * 100, 0)}%</span>
                  </div>
                  <Slider
                    value={[params.etaSoil * 100]}
                    onValueChange={([v]) => onParamChange({ etaSoil: v / 100 })}
                    min={90}
                    max={97}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">MPPT</Label>
                    <span className="text-xs font-mono">{formatValue(params.etaCtrl * 100, 0)}%</span>
                  </div>
                  <Slider
                    value={[params.etaCtrl * 100]}
                    onValueChange={([v]) => onParamChange({ etaCtrl: v / 100 })}
                    min={70}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Ángulo</Label>
                    <span className="text-xs font-mono">{formatValue(params.etaAOI * 100, 0)}%</span>
                  </div>
                  <Slider
                    value={[params.etaAOI * 100]}
                    onValueChange={([v]) => onParamChange({ etaAOI: v / 100 })}
                    min={90}
                    max={97}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Columna 2: Geometría */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">Geometría y sombras</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Cielo visible</Label>
                    <span className="text-xs font-mono">{formatValue(params.svf, 2)}</span>
                  </div>
                  <Slider
                    value={[params.svf * 100]}
                    onValueChange={([v]) => onParamChange({ svf: v / 100 })}
                    min={50}
                    max={80}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Sol directo</Label>
                    <span className="text-xs font-mono">{params.midStart}:00 - {params.midEnd}:00</span>
                  </div>
                  <div className="flex gap-2">
                    <Slider
                      value={[params.midStart]}
                      onValueChange={([v]) => onParamChange({ midStart: v })}
                      min={8}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <Slider
                      value={[params.midEnd]}
                      onValueChange={([v]) => onParamChange({ midEnd: v })}
                      min={13}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botón para recalcular */}
            <Button 
              onClick={onRecalculate}
              disabled={loading}
              className="w-full"
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Recalcular con nuevos parámetros
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}