'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PredictionResult } from '@/lib/solar-predictions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Cloud, Sun, Zap } from 'lucide-react';

interface PredictionResultCardProps {
  prediction: PredictionResult;
  compact?: boolean;
}

export function PredictionResultCard({ prediction, compact = false }: PredictionResultCardProps) {
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{format(new Date(prediction.date + 'T12:00:00'), 'EEE d', { locale: es })}</span>
            {prediction.cloudCoverMedian > 40 ? (
              <Cloud className={cn(
                "h-3 w-3",
                prediction.cloudCoverMedian >= 75 ? "text-muted-foreground" : "text-blue-500"
              )} />
            ) : (
              <Sun className="h-3 w-3 text-yellow-500" />
            )}
            {prediction.cloudCoverMedian}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-lg font-bold text-primary">
                {prediction.ahEstimated} Ah
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {prediction.whEstimated} Wh • {prediction.pshEffective}h PSH
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="prediction-result">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{format(new Date(prediction.date + 'T12:00:00'), 'EEEE, d MMMM', { locale: es })}</span>
          <div className="flex items-center gap-2">
            {prediction.cloudCoverMedian > 50 ? (
              <Cloud className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Sun className="h-4 w-4 text-yellow-500" />
            )}
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              prediction.dataQuality.isValid 
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            )}>
              {prediction.dataQuality.source === 'archive' ? 'Histórico' : 'Pronóstico'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Generación estimada</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {prediction.ahEstimated} Ah
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Energía</span>
              <p className="text-sm font-medium">{prediction.whEstimated} Wh</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">PSH efectivas</span>
              <p className="text-sm font-medium">{prediction.pshEffective} h</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Directa/Difusa</span>
              <p className="text-sm font-medium">{prediction.pshDirect}/{prediction.pshDiffuse} h</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Nubosidad</span>
              <p className="text-sm font-medium">{prediction.cloudCoverMedian}%</p>
            </div>
          </div>

          {!prediction.dataQuality.isValid && (
            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3 w-3" />
              <span>Datos parciales ({(prediction.dataQuality.validFraction * 100).toFixed(0)}% válidos)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}