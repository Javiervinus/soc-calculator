'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useBatteryStore } from '@/lib/store';
import { 
  getMultiplePredictions,
  getNextNDays,
  PredictionResult,
  PredictionParams
} from '@/lib/solar-predictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { 
  Sun, 
  Calendar as CalendarIcon,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { PredictionResultCard } from '@/components/predictions/prediction-result-card';
import { PredictionParams as ParamsPanel } from '@/components/predictions/prediction-params';
import { WeekChart } from '@/components/predictions/week-chart';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PredictionsPage() {
  const { 
    getCurrentProfile, 
    predictionParams, 
    updatePredictionParams,
    getPredictionCache,
    savePredictionCache,
    appTheme
  } = useBatteryStore();

  const [mode, setMode] = useState<'single' | 'week'>('single');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Por defecto, mañana
    return addDays(new Date(), 1);
  });
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showParams, setShowParams] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const resultRef = useRef<HTMLDivElement>(null);
  const profile = getCurrentProfile();
  const cache = useMemo(() => getPredictionCache(), []);

  // Parámetros completos incluyendo los del sistema
  const fullParams: PredictionParams = useMemo(() => ({
    ...predictionParams,
    nPanels: profile.batteryConfig.numberOfPanels,
    pPanelSTC_W: profile.batteryConfig.panelPowerEach
  }), [predictionParams, profile.batteryConfig]);

  // Calcular predicción
  const calculatePredictions = useCallback(async (forceRefresh = false, scrollToResult = true) => {
    setLoading(true);
    setProgress({ current: 0, total: 0 });

    try {
      // Invalidar caché si se fuerza refresh
      if (forceRefresh) {
        if (mode === 'single') {
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          cache.invalidate(dateStr);
        } else if (mode === 'week') {
          cache.invalidate();
        }
      }

      let dates: string[] = [];
      
      if (mode === 'single') {
        dates = [format(selectedDate, 'yyyy-MM-dd')];
      } else if (mode === 'week') {
        dates = getNextNDays(7, false);
      }

      if (dates.length > 0) {
        const results = await getMultiplePredictions(
          dates,
          fullParams,
          cache,
          (current, total) => setProgress({ current, total })
        );
        
        setPredictions(results);
        savePredictionCache(cache);
        
        // Auto-scroll a resultados en móvil
        if (isMobile && scrollToResult && mode === 'single') {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
        
        // Mensaje de éxito más discreto
        if (forceRefresh) {
          toast.success('Predicción actualizada');
        }
      }
    } catch (error) {
      console.error('Error calculating predictions:', error);
      toast.error('Error al calcular las predicciones');
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [mode, selectedDate, fullParams, cache, savePredictionCache, isMobile]);

  // Calcular automáticamente al cambiar de modo
  useEffect(() => {
    if (mode === 'week') {
      calculatePredictions(false, false);
    }
  }, [mode]);

  // Funciones de navegación rápida
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1)
      : subDays(selectedDate, 1);
    
    const today = new Date();
    const maxDate = addDays(today, 7);
    
    if (newDate >= today && newDate <= maxDate) {
      setSelectedDate(newDate);
    }
  };

  // Efecto para recalcular cuando cambia la fecha seleccionada
  useEffect(() => {
    if (mode === 'single') {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      cache.invalidate(dateStr);
      calculatePredictions(true);
    }
  }, [selectedDate]);

  // Estilo del tema
  const themeClasses = {
    default: '',
    futuristic: 'font-orbitron',
    minimal: 'font-inter',
    retro: 'font-pressstart text-[10px] sm:text-[11px]',
    hippie: 'font-fredoka'
  };

  // Obtener el resultado actual para modo single
  const currentPrediction = mode === 'single' && predictions.length > 0 ? predictions[0] : null;

  return (
    <div className={cn("container max-w-7xl mx-auto p-4 pb-20", themeClasses[appTheme])}>
      <div className="space-y-4">
        {/* Tabs principales con info del sistema integrada */}
        <div className="space-y-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'week')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Día específico</span>
                <span className="sm:hidden">Día</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Próximos 7 días</span>
                <span className="sm:hidden">7 días</span>
              </TabsTrigger>
            </TabsList>


            {/* Contenido para día único */}
            <TabsContent value="single" className="space-y-4 mt-4">
              {!isMobile ? (
                // DESKTOP: Layout horizontal mejorado
                <div className="grid grid-cols-3 gap-6">
                  {/* Columna izquierda: Controles (1 columna) */}
                  <div className="col-span-1 space-y-4">
                    {/* Selector de fecha simplificado */}
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        {/* Navegación principal */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigateDate('prev')}
                            disabled={selectedDate <= new Date()}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="px-4 min-w-[200px] justify-center"
                              >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="center">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                  if (date) {
                                    setSelectedDate(date);
                                    setCalendarOpen(false);
                                  }
                                }}
                                locale={es}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const maxDate = addDays(today, 7);
                                  return date < today || date > maxDate;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigateDate('next')}
                            disabled={selectedDate >= addDays(new Date(), 7)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Accesos rápidos */}
                        <div className="grid grid-cols-4 gap-2">
                          {[0, 1, 2, 3, 4, 5, 6, 7].map(days => {
                            const date = addDays(new Date(), days);
                            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                              <Button
                                key={days}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setSelectedDate(date);
                                }}
                                className="text-xs h-12"
                              >
                                <div className="flex flex-col justify-center gap-0">
                                  <span>{days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : format(date, 'EEE', { locale: es })}</span>
                                  <span className="text-[9px] opacity-60">{format(date, 'd', { locale: es })}</span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>

                        <Button 
                          onClick={() => calculatePredictions(true)}
                          disabled={loading}
                          className="w-full"
                          variant={currentPrediction ? "outline" : "default"}
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Calculando...
                            </>
                          ) : currentPrediction ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Actualizar predicción
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Calcular predicción
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Parámetros ajustables */}
                    <ParamsPanel
                      params={predictionParams}
                      onParamChange={updatePredictionParams}
                      onRecalculate={() => calculatePredictions(true)}
                      loading={loading}
                      open={showParams}
                      onOpenChange={setShowParams}
                    />
                  </div>

                  {/* Columna derecha: Resultado (2 columnas) */}
                  <div className="col-span-2">
                    {currentPrediction ? (
                      <PredictionResultCard prediction={currentPrediction} />
                    ) : (
                      <Card className="h-full min-h-[400px] flex items-center justify-center">
                        <CardContent>
                          <div className="text-center space-y-2">
                            <Sun className="h-16 w-16 mx-auto text-muted-foreground/30" />
                            <p className="text-lg text-muted-foreground">
                              Selecciona una fecha y calcula la predicción
                            </p>
                            <p className="text-sm text-muted-foreground/70">
                              Los datos meteorológicos son obtenidos de Open-Meteo
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ) : (
                // MÓVIL: Layout vertical optimizado sin cards innecesarias
                <div className="space-y-4">
                  {/* Selector de fecha compacto */}
                  <div className="space-y-3">
                    {/* Botones de días rápidos */}
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map(days => {
                        const date = addDays(new Date(), days);
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                          <Button
                            key={days}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedDate(date);
                            }}
                            className="h-14 flex flex-col justify-center gap-0 text-xs"
                          >
                            <span>{days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : format(date, 'EEE', { locale: es })}</span>
                            <span className="text-[10px] opacity-60">{format(date, 'd', { locale: es })}</span>
                          </Button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[4, 5, 6, 7].map(days => {
                        const date = addDays(new Date(), days);
                        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        return (
                          <Button
                            key={days}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedDate(date);
                            }}
                            className="h-14 flex flex-col justify-center gap-0 text-xs"
                          >
                            <span>{format(date, 'EEE', { locale: es })}</span>
                            <span className="text-[10px] opacity-60">{format(date, 'd', { locale: es })}</span>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Botón de calcular/actualizar cuando hay resultado */}
                    {currentPrediction && (
                      <Button 
                        onClick={() => calculatePredictions(true)}
                        disabled={loading}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Resultado */}
                  <div ref={resultRef}>
                    {currentPrediction ? (
                      <PredictionResultCard prediction={currentPrediction} />
                    ) : (
                      <Card>
                        <CardContent className="py-8">
                          <div className="text-center space-y-2">
                            <Sun className="h-12 w-12 mx-auto text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">
                              Selecciona un día para ver la predicción
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Parámetros */}
                  <ParamsPanel
                    params={predictionParams}
                    onParamChange={updatePredictionParams}
                    onRecalculate={() => calculatePredictions(true)}
                    loading={loading}
                    open={showParams}
                    onOpenChange={setShowParams}
                  />
                </div>
              )}
            </TabsContent>

            {/* Contenido para semana */}
            <TabsContent value="week" className="space-y-4 mt-4">
              {!isMobile ? (
                // DESKTOP: Layout con gráfico prominente
                <div className="space-y-4">
                  {/* Controles en una línea */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Predicción para los próximos 7 días
                    </h3>
                    <Button 
                      onClick={() => calculatePredictions(true)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Actualizando ({progress.current}/{progress.total})
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Actualizar datos
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progreso si está cargando */}
                  {loading && progress.total > 0 && (
                    <Progress value={(progress.current / progress.total) * 100} className="h-2" />
                  )}

                  {/* Layout principal */}
                  {predictions.length > 0 && (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Gráfico (3 columnas) */}
                        <div className="col-span-3">
                          <WeekChart predictions={predictions} />
                        </div>
                        
                        {/* Resumen (1 columna) */}
                        <div>
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Resumen</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Promedio diario</p>
                                  <p className="text-2xl font-bold">
                                    {(predictions.reduce((acc, p) => acc + p.ahEstimated, 0) / predictions.length).toFixed(1)} Ah
                                  </p>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Máximo:</span>
                                  <span className="font-medium">
                                    {Math.max(...predictions.map(p => p.ahEstimated))} Ah
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Mínimo:</span>
                                  <span className="font-medium">
                                    {Math.min(...predictions.map(p => p.ahEstimated))} Ah
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Total 7 días:</span>
                                  <span className="font-medium">
                                    {predictions.reduce((acc, p) => acc + p.ahEstimated, 0).toFixed(0)} Ah
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Resultados detallados */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {predictions.map((prediction) => (
                          <PredictionResultCard 
                            key={prediction.date} 
                            prediction={prediction} 
                            compact 
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Parámetros */}
                  <ParamsPanel
                    params={predictionParams}
                    onParamChange={updatePredictionParams}
                    onRecalculate={() => calculatePredictions(true)}
                    loading={loading}
                    open={showParams}
                    onOpenChange={setShowParams}
                  />
                </div>
              ) : (
                // MÓVIL: Layout vertical sin cards redundantes
                <div className="space-y-4">
                  {/* Controles integrados */}
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">Próximos 7 días</span>
                    <Button 
                      onClick={() => calculatePredictions(true)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          {progress.current}/{progress.total}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Actualizar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Progreso */}
                  {loading && progress.total > 0 && (
                    <Progress value={(progress.current / progress.total) * 100} className="h-2" />
                  )}

                  {/* Resultados */}
                  {predictions.length > 0 && (
                    <>
                      {/* Gráfico */}
                      <WeekChart predictions={predictions} />
                      
                      {/* Cards compactas */}
                      <div className="grid grid-cols-2 gap-3">
                        {predictions.map((prediction) => (
                          <PredictionResultCard 
                            key={prediction.date} 
                            prediction={prediction} 
                            compact 
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Parámetros */}
                  <ParamsPanel
                    params={predictionParams}
                    onParamChange={updatePredictionParams}
                    onRecalculate={() => calculatePredictions(true)}
                    loading={loading}
                    open={showParams}
                    onOpenChange={setShowParams}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}