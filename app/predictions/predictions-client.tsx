'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getNextNDays,
  PredictionResult,
  DEFAULT_PREDICTION_PARAMS
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
import { useSolarPredictions } from '@/lib/hooks/use-solar-predictions';
import { useUserPreferences } from '@/lib/hooks/use-user-preferences';

export function PredictionsClient() {
  const { 
    fullParams,
    isConfigLoaded,
    useSinglePrediction,
    useWeekPredictions,
    updatePredictionParams,
    clearCache,
    isUpdatingParams,
    isClearingCache
  } = useSolarPredictions();

  const { preferences, appTheme } = useUserPreferences();

  const [mode, setMode] = useState<'single' | 'week'>('single');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Por defecto, mañana
    return addDays(new Date(), 1);
  });
  const [showParams, setShowParams] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [singlePredictionEnabled, setSinglePredictionEnabled] = useState(false);
  const [weekPredictionEnabled, setWeekPredictionEnabled] = useState(false);
  
  const isMobile = useIsMobile();
  const resultRef = useRef<HTMLDivElement>(null);

  // Usar los hooks condicionalmente
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const singleQuery = useSinglePrediction(selectedDateStr, singlePredictionEnabled && mode === 'single');
  const weekQuery = useWeekPredictions(weekPredictionEnabled && mode === 'week');

  // Funciones de navegación rápida
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(selectedDate, 1)
      : subDays(selectedDate, 1);
    
    const today = new Date();
    const maxDate = addDays(today, 7);
    
    if (newDate >= today && newDate <= maxDate) {
      setSelectedDate(newDate);
      setSinglePredictionEnabled(false); // Reset para requerir click en calcular
    }
  };

  // Calcular predicción (manual trigger)
  const calculateSinglePrediction = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      // Si es actualización, limpiar caché primero
      clearCache(selectedDateStr);
      setSinglePredictionEnabled(false);
      // Pequeño delay para asegurar que el caché se limpió
      setTimeout(() => {
        setSinglePredictionEnabled(true);
      }, 100);
    } else {
      setSinglePredictionEnabled(true);
    }
    
    // Auto-scroll a resultados en móvil
    if (isMobile) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [isMobile, selectedDateStr, clearCache]);

  const calculateWeekPrediction = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      // Si es actualización, limpiar todo el caché primero
      clearCache(undefined);
      setWeekPredictionEnabled(false);
      // Pequeño delay para asegurar que el caché se limpió
      setTimeout(() => {
        setWeekPredictionEnabled(true);
      }, 100);
    } else {
      setWeekPredictionEnabled(true);
    }
  }, [clearCache]);

  // Recalcular con nuevos parámetros
  const handleRecalculate = useCallback(() => {
    if (mode === 'single') {
      // Limpiar caché de esta fecha y recalcular
      clearCache(selectedDateStr);
      setSinglePredictionEnabled(false);
      setTimeout(() => setSinglePredictionEnabled(true), 100);
    } else {
      // Limpiar todo el caché y recalcular semana
      clearCache(undefined);
      setWeekPredictionEnabled(false);
      setTimeout(() => setWeekPredictionEnabled(true), 100);
    }
  }, [mode, selectedDateStr, clearCache]);

  // Actualizar predicción al cambiar de modo
  useEffect(() => {
    if (mode === 'week' && !weekPredictionEnabled && !weekQuery.data) {
      calculateWeekPrediction();
    }
  }, [mode, weekPredictionEnabled, weekQuery.data, calculateWeekPrediction]);

  // Estilo del tema
  const themeClasses: Record<string, string> = {
    default: '',
    futuristic: 'font-orbitron',
    minimal: 'font-inter',
    retro: 'font-pressstart text-[10px] sm:text-[11px]',
    hippie: 'font-fredoka'
  };

  // Obtener el resultado actual para modo single
  const currentPrediction = mode === 'single' ? singleQuery.data : null;
  const weekPredictions = mode === 'week' ? weekQuery.data : [];

  // Estados de carga
  const isLoadingSingle = singleQuery.isFetching;
  const isLoadingWeek = weekQuery.isFetching;
  const loading = mode === 'single' ? isLoadingSingle : isLoadingWeek;

  // Manejar cambio de parámetros
  const handleParamChange = (key: string, value: number) => {
    const updates: any = {};
    
    // Mapear parámetros a campos de user_preferences
    if (key === 'etaElec') {
      updates.prediction_efficiency = value;
    } else if (key === 'tiltAngle') {
      updates.prediction_tilt_angle = value;
    } else if (key === 'azimuth') {
      updates.prediction_azimuth = value;
    } else if (key === 'tempCoeff') {
      updates.prediction_temperature_coefficient = value;
    }

    if (Object.keys(updates).length > 0) {
      updatePredictionParams(updates);
    }
  };

  // Parámetros para mostrar en el panel
  const displayParams = {
    etaElec: preferences?.prediction_efficiency || DEFAULT_PREDICTION_PARAMS.etaElec,
    etaSoil: DEFAULT_PREDICTION_PARAMS.etaSoil,
    etaCtrl: DEFAULT_PREDICTION_PARAMS.etaCtrl,
    etaAOI: DEFAULT_PREDICTION_PARAMS.etaAOI,
    svf: DEFAULT_PREDICTION_PARAMS.svf,
    midStart: DEFAULT_PREDICTION_PARAMS.midStart,
    midEnd: DEFAULT_PREDICTION_PARAMS.midEnd,
  };

  if (!isConfigLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container max-w-7xl mx-auto p-4 pb-20", themeClasses[appTheme || 'default'])}>
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
                                    setSinglePredictionEnabled(false);
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
                                  setSinglePredictionEnabled(false);
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
                          onClick={() => calculateSinglePrediction(!!currentPrediction)}
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
                      params={displayParams}
                      onParamChange={handleParamChange}
                      onRecalculate={handleRecalculate}
                      loading={loading || isUpdatingParams}
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
                              setSinglePredictionEnabled(false);
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
                              setSinglePredictionEnabled(false);
                            }}
                            className="h-14 flex flex-col justify-center gap-0 text-xs"
                          >
                            <span>{format(date, 'EEE', { locale: es })}</span>
                            <span className="text-[10px] opacity-60">{format(date, 'd', { locale: es })}</span>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Botón de calcular/actualizar */}
                    {!currentPrediction && (
                      <Button 
                        onClick={() => calculateSinglePrediction(false)}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Calcular predicción
                          </>
                        )}
                      </Button>
                    )}

                    {currentPrediction && (
                      <Button 
                        onClick={() => calculateSinglePrediction(true)}
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
                    params={displayParams}
                    onParamChange={handleParamChange}
                    onRecalculate={handleRecalculate}
                    loading={loading || isUpdatingParams}
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
                      onClick={() => calculateWeekPrediction(true)}
                      disabled={loading}
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
                          Actualizar datos
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Layout principal */}
                  {weekPredictions && weekPredictions.length > 0 && (
                    <>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Gráfico (3 columnas) */}
                        <div className="col-span-3">
                          <WeekChart predictions={weekPredictions} />
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
                                    {(weekPredictions.reduce((acc, p) => acc + p.ahEstimated, 0) / weekPredictions.length).toFixed(1)} Ah
                                  </p>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Máximo:</span>
                                  <span className="font-medium">
                                    {Math.max(...weekPredictions.map(p => p.ahEstimated))} Ah
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Mínimo:</span>
                                  <span className="font-medium">
                                    {Math.min(...weekPredictions.map(p => p.ahEstimated))} Ah
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Total 7 días:</span>
                                  <span className="font-medium">
                                    {weekPredictions.reduce((acc, p) => acc + p.ahEstimated, 0).toFixed(0)} Ah
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      {/* Resultados detallados */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weekPredictions.map((prediction) => (
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
                    params={displayParams}
                    onParamChange={handleParamChange}
                    onRecalculate={handleRecalculate}
                    loading={loading || isUpdatingParams}
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
                      onClick={() => calculateWeekPrediction(true)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Actualizando
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Actualizar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Resultados */}
                  {weekPredictions && weekPredictions.length > 0 && (
                    <>
                      {/* Gráfico */}
                      <WeekChart predictions={weekPredictions} />
                      
                      {/* Cards compactas */}
                      <div className="grid grid-cols-2 gap-3">
                        {weekPredictions.map((prediction) => (
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
                    params={displayParams}
                    onParamChange={handleParamChange}
                    onRecalculate={handleRecalculate}
                    loading={loading || isUpdatingParams}
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