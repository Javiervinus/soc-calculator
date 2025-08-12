'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { VoltageSOCEntry } from '@/lib/battery-data';
import { useBatteryStore } from '@/lib/store';
import { createEcuadorDate, formatEcuadorDateString, getTodayEcuadorDateString } from '@/lib/timezone-utils';
import { Cloud, CloudDownload, CloudUpload, Copy, Download, Moon, Plus, RefreshCw, Save, Settings, Share2, Sun, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConsumptionEditor } from './consumption-editor';

export function SettingsPanel() {
  const { 
    profiles, 
    currentProfileId, 
    getCurrentProfile,
    setCurrentProfile,
    createProfile,
    deleteProfile,
    updateProfile,
    updateBatteryConfig,
    updateVoltageSOCTable,
    resetToDefaults,
    theme,
    setTheme,
    getSOCHistory,
    clearSOCHistory,
    exportFullState,
    importFullState,
    pushToCloud,
    pullFromCloud,
  } = useBatteryStore();

  const currentProfile = getCurrentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [tableText, setTableText] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [importSOCText, setImportSOCText] = useState('');
  const [importFullStateText, setImportFullStateText] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleSaveReserve = (value: number[]) => {
    updateBatteryConfig({ safetyReserve: value[0] });
  };

  const handleSaveCapacity = () => {
    const ahInput = document.getElementById('capacity-ah') as HTMLInputElement;
    const whInput = document.getElementById('capacity-wh') as HTMLInputElement;
    
    if (ahInput && whInput) {
      updateBatteryConfig({
        capacityAh: parseFloat(ahInput.value),
        capacityWh: parseFloat(whInput.value),
      });
    }
  };

  const handleImportTable = () => {
    const lines = tableText.trim().split('\n');
    const newTable: VoltageSOCEntry[] = [];
    
    for (const line of lines) {
      const match = line.match(/(\d+\.?\d*)\s*V?\s*[→\->\t]\s*(\d+\.?\d*)\s*%?/);
      if (match) {
        newTable.push({
          voltage: parseFloat(match[1]),
          soc: parseFloat(match[2]),
        });
      }
    }
    
    if (newTable.length > 0) {
      updateVoltageSOCTable(newTable);
      setTableText('');
    }
  };

  const handleExportTable = () => {
    const tableString = currentProfile.voltageSOCTable
      .map(entry => `${entry.voltage.toFixed(2)} V → ${entry.soc.toFixed(1)} %`)
      .join('\n');
    
    const blob = new Blob([tableString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltage-soc-table-${currentProfile.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateProfile = () => {
    if (newProfileName.trim()) {
      createProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  const handleExportProfile = () => {
    const profileData = {
      name: currentProfile.name,
      voltageSOCTable: currentProfile.voltageSOCTable,
      batteryConfig: currentProfile.batteryConfig,
      consumptionProfile: currentProfile.consumptionProfile,
      consumptionTramos: currentProfile.consumptionTramos,
      socHistory: currentProfile.socHistory,
    };
    
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-${currentProfile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSOCHistory = () => {
    const history = getSOCHistory();
    if (history.length === 0) {
      return;
    }
    
    // Crear CSV con el histórico en formato ISO para evitar problemas
    const csvContent = [
      ['Fecha', 'Hora', 'SOC (%)'].join(','),
      ...history.map(entry => {
        const date = new Date(entry.timestamp);
        // Formato YYYY-MM-DD y HH:MM (24 horas) para evitar ambigüedades
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return [
          `${year}-${month}-${day}`,
          `${hours}:${minutes}`,
          entry.soc
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-soc-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearSOCHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el histórico de SOC?')) {
      clearSOCHistory();
    }
  };

  const handleImportSOCHistory = () => {
    try {
      const lines = importSOCText.trim().split('\n');
      let importedCount = 0;
      let skippedCount = 0;
      
      // Saltar header si existe
      const startIndex = lines[0].toLowerCase().includes('fecha') ? 1 : 0;
      
      // Primero recolectar todas las entradas válidas
      const newEntries = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Intentar parsear CSV: Fecha, Hora, SOC (%)
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const dateStr = parts[0];
          const timeStr = parts[1];
          const socStr = parts[2];
          
          // Parsear SOC
          const soc = parseFloat(socStr.replace('%', ''));
          
          if (!isNaN(soc)) {
            let year, month, day;
            
            // Intentar diferentes formatos de fecha
            if (dateStr.includes('-')) {
              // Formato YYYY-MM-DD
              const parts = dateStr.split('-');
              year = parseInt(parts[0]);
              month = parseInt(parts[1]) - 1; // Meses en JS son 0-indexed
              day = parseInt(parts[2]);
            } else if (dateStr.includes('/')) {
              // Formato M/D/YYYY (americano) o DD/MM/YYYY
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                // Asumimos formato M/D/YYYY para ser consistentes con tu CSV
                month = parseInt(parts[0]) - 1;
                day = parseInt(parts[1]);
                year = parseInt(parts[2]);
                
                // Si el año tiene 2 dígitos, convertir a 4
                if (year < 100) {
                  year += 2000;
                }
              }
            }
            
            // Parsear hora
            let hour = 17; // Por defecto 5 PM
            let minute = 0;
            
            if (timeStr) {
              // Limpiar la cadena de tiempo
              const timeCleaned = timeStr.trim().toLowerCase();
              
              // Detectar AM/PM
              const isPM = timeCleaned.includes('p') && timeCleaned.includes('m');
              const isAM = timeCleaned.includes('a') && timeCleaned.includes('m');
              
              // Extraer números de hora
              const timeMatch = timeCleaned.match(/(\d{1,2}):(\d{2})/);
              if (timeMatch) {
                hour = parseInt(timeMatch[1]);
                minute = parseInt(timeMatch[2]);
                
                // Convertir a formato 24 horas si hay indicador AM/PM
                if (isPM && hour < 12) {
                  hour += 12;
                } else if (isAM && hour === 12) {
                  hour = 0;
                }
                // Si no hay AM/PM y la hora es menor a 12, asumimos que es formato 24h
              }
            }
            
            // Verificar que tenemos valores válidos antes de crear la fecha
            if (year !== undefined && month !== undefined && day !== undefined) {
              // Usar la utilidad para crear fecha en Ecuador
              const date = createEcuadorDate(year, month, day, hour, minute);
              
              if (!isNaN(date.getTime())) {
                // Generar la clave de fecha usando la utilidad
                const dateKey = formatEcuadorDateString(date);
                const existing = getSOCHistory().find(e => e.date === dateKey);
              
                if (!existing) {
                  newEntries.push({
                    date: dateKey,
                    timestamp: date,
                    soc
                  });
                  importedCount++;
                } else {
                  skippedCount++;
                }
              }
            }
          }
        }
      }
      
      // Agregar todas las entradas nuevas de una vez
      if (newEntries.length > 0) {
        const newHistory = [...(currentProfile.socHistory || []), ...newEntries]
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        updateProfile(currentProfileId, { socHistory: newHistory });
        
        // Verificar si alguna entrada es del día de hoy (usando fecha de Ecuador)
        const today = getTodayEcuadorDateString();
        
        const hasToday = newEntries.some(entry => entry.date === today);
        
        if (hasToday) {
          toast.info('Se importó el SOC de hoy', {
            description: 'El botón de guardar se actualizará'
          });
        }
      }
      
      if (importedCount > 0) {
        toast.success(`${importedCount} registros importados`, {
          description: skippedCount > 0 ? `${skippedCount} registros omitidos (ya existían)` : undefined
        });
        setImportSOCText('');
      } else {
        toast.error('No se pudo importar ningún registro', {
          description: 'Verifica el formato: Fecha,Hora,SOC(%)'
        });
      }
    } catch (error) {
      console.error('Error al importar:', error);
      toast.error('Error al importar', {
        description: 'Formato inválido. Acepta: M/D/YYYY o DD/MM/YYYY'
      });
    }
  };

  const handleCopyFullState = async () => {
    const stateJson = exportFullState();
    try {
      await navigator.clipboard.writeText(stateJson);
      toast.success('Configuración copiada', {
        description: 'La configuración completa ha sido copiada al portapapeles'
      });
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar al portapapeles'
      });
    }
  };

  const handleShareFullState = async () => {
    const stateJson = exportFullState();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Configuración SOC Calculator',
          text: stateJson
        });
      } catch (error) {
        // Si el usuario cancela, no mostramos error
        if ((error as Error).name !== 'AbortError') {
          toast.error('Error al compartir');
        }
      }
    } else {
      // Fallback: copiar al portapapeles si no hay API de compartir
      handleCopyFullState();
    }
  };

  const handleImportFullState = () => {
    if (!importFullStateText.trim()) {
      toast.error('Por favor pega la configuración');
      return;
    }

    const result = importFullState(importFullStateText);
    
    if (result.success) {
      toast.success(result.message, {
        duration: 3000 // Mostrar el toast por 3 segundos
      });
      setImportFullStateText('');
      // Recargar para aplicar todos los cambios
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast.error(result.message);
    }
  };

  const handlePushToCloud = async () => {
    setIsPushing(true);
    try {
      const result = await pushToCloud();
      
      if (result.success) {
        toast.success(result.message, {
          description: 'Backup subido a la nube'
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al subir el backup');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullFromCloud = async () => {
    setIsPulling(true);
    try {
      const result = await pullFromCloud();
      
      if (result.success) {
        toast.success(result.message, {
          description: 'Configuración restaurada desde la nube',
          duration: 3000 // Mostrar el toast por 3 segundos
        });
        // Recargar para aplicar todos los cambios
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al obtener el backup');
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <Sheet  open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-white dark:bg-black">
        <SheetHeader className="px-6">
          <SheetTitle className="dark:text-white">Configuración</SheetTitle>
          <SheetDescription className="dark:text-gray-400">
            Ajusta los parámetros de la batería y gestiona perfiles
          </SheetDescription>
        </SheetHeader>

        {/* Botón de Backup arriba de los tabs */}
        <div className="px-6 mt-4">
          <details className="group">
            <summary className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 cursor-pointer hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Save className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Backup Completo</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">Exportar o importar toda tu configuración</p>
                </div>
              </div>
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            
            <div className="mt-4 space-y-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
              {/* Backup en la Nube */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Backup en la Nube
                </h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePushToCloud} 
                    variant="default" 
                    size="sm"
                    className="flex-1"
                    disabled={isPushing || isPulling}
                  >
                    {isPushing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-3.5 w-3.5 mr-1.5" />
                        Push
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handlePullFromCloud} 
                    variant="secondary" 
                    size="sm"
                    className="flex-1"
                    disabled={isPushing || isPulling}
                  >
                    {isPulling ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Descargando...
                      </>
                    ) : (
                      <>
                        <CloudDownload className="h-3.5 w-3.5 mr-1.5" />
                        Pull
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Push sube un nuevo backup. Pull trae el más reciente y reemplaza tu configuración local.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Backup Local</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyFullState} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copiar
                  </Button>
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button 
                      onClick={handleShareFullState} 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1.5" />
                      Compartir
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">Importar Configuración</h3>
                <Textarea
                  placeholder="Pega aquí la configuración JSON..."
                  value={importFullStateText}
                  onChange={(e) => setImportFullStateText(e.target.value)}
                  className="h-24 font-mono text-xs"
                />
                <Button 
                  onClick={handleImportFullState}
                  size="sm"
                  className="w-full"
                  disabled={!importFullStateText.trim()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Importar
                </Button>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Importar reemplazará todos tus datos actuales
                </p>
              </div>
            </div>
          </details>
        </div>

        <Tabs defaultValue="battery" className="mt-4 px-6">
          <TabsList className="grid w-full grid-cols-5 dark:bg-gray-900 text-xs">
            <TabsTrigger value="battery">Batería</TabsTrigger>
            <TabsTrigger value="consumption">Consumo</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
            <TabsTrigger value="profiles">Perfiles</TabsTrigger>
          </TabsList>

          <TabsContent value="battery" className="space-y-6 mb-10">
            <div className="space-y-4">
              <h3 className="font-semibold">Capacidad de la Batería</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity-ah">Capacidad (Ah)</Label>
                  <Input
                    id="capacity-ah"
                    type="number"
                    defaultValue={currentProfile.batteryConfig.capacityAh}
                    step="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity-wh">Capacidad (Wh)</Label>
                  <Input
                    id="capacity-wh"
                    type="number"
                    defaultValue={currentProfile.batteryConfig.capacityWh}
                    step="10"
                  />
                </div>
              </div>
              <Button onClick={handleSaveCapacity} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Guardar Capacidad
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Reserva de Seguridad</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reserva actual</span>
                  <span className="font-medium">{currentProfile.batteryConfig.safetyReserve}%</span>
                </div>
                <Slider
                  value={[currentProfile.batteryConfig.safetyReserve]}
                  onValueChange={handleSaveReserve}
                  min={0}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Apariencia</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-500" />
                  )}
                  <Label htmlFor="theme-switch">Modo Oscuro</Label>
                </div>
                <Switch
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Información del Sistema de Batería</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Química</span>
                  <span className="font-medium">{currentProfile.batteryConfig.chemistry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidad Total</span>
                  <span className="font-medium">{currentProfile.batteryConfig.capacityAh} Ah / {currentProfile.batteryConfig.capacityKwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voltaje Nominal</span>
                  <span className="font-medium">{currentProfile.batteryConfig.nominalVoltage} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Configuración</span>
                  <span className="font-medium text-right text-xs">{currentProfile.batteryConfig.batteryConfiguration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Baterías</span>
                  <span className="font-medium">{currentProfile.batteryConfig.numberOfBatteries} × {currentProfile.batteryConfig.batteryCapacityEach} Ah</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Sistema Solar</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potencia Total</span>
                  <span className="font-medium">{currentProfile.batteryConfig.solarPowerTotal} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paneles</span>
                  <span className="font-medium">{currentProfile.batteryConfig.numberOfPanels} × {currentProfile.batteryConfig.panelPowerEach} W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Panel</span>
                  <span className="font-medium">{currentProfile.batteryConfig.panelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Configuración</span>
                  <span className="font-medium text-right text-xs">{currentProfile.batteryConfig.panelConfiguration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">V/I por Panel</span>
                  <span className="font-medium">{currentProfile.batteryConfig.panelVoltage} V / {currentProfile.batteryConfig.panelCurrent} A</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Controlador de Carga</h3>
              <div className="space-y-2 text-sm">

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{currentProfile.batteryConfig.controllerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacidad</span>
                  <span className="font-medium">{currentProfile.batteryConfig.controllerCapacity} A</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consumption" className="space-y-4">
            <ConsumptionEditor />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Histórico de SOC</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Registros guardados
                  </span>
                  <span className="font-medium">
                    {getSOCHistory().length} días
                  </span>
                </div>
                
                {getSOCHistory().length > 0 && (
                  <>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      <div className="space-y-1 text-xs">
                        {getSOCHistory().slice(-10).reverse().map((entry, index) => {
                          const date = new Date(entry.timestamp);
                          return (
                            <div key={index} className="flex justify-between py-1 border-b last:border-0">
                              <span>{date.toLocaleDateString('es-EC')}</span>
                              <span className="font-mono">{entry.soc}%</span>
                            </div>
                          );
                        })}
                        {getSOCHistory().length > 10 && (
                          <div className="text-center text-muted-foreground pt-2">
                            ... y {getSOCHistory().length - 10} registros más
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleExportSOCHistory} 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                      <Button 
                        onClick={handleClearSOCHistory} 
                        variant="destructive" 
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                      </Button>
                    </div>
                  </>
                )}
                
                {getSOCHistory().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay datos históricos</p>
                    <p className="text-xs mt-1">Comienza a guardar tu SOC diario</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Importar Histórico</h3>
                <Textarea
                  placeholder="Pega aquí datos CSV:☯☸Fecha,Hora,SOC(%)☯☸2025-08-11,17:00,100☯☸8/11/2025,5:00:00 p.m.,100☯☸8/11/2025,17:00,100"
                  value={importSOCText}
                  onChange={(e) => setImportSOCText(e.target.value)}
                  className="h-32 font-mono text-sm"
                />
                <Button 
                  onClick={handleImportSOCHistory}
                  className="w-full"
                  disabled={!importSOCText.trim()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Datos
                </Button>
              </div>
              
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-900 dark:text-blue-300">
                  <strong>Recomendación:</strong> Guarda tu SOC diariamente entre las 4-5 PM para obtener lecturas consistentes antes del ciclo nocturno.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Importar Tabla Voltaje → SOC</h3>
              <Textarea
                placeholder="Pega aquí tu tabla en formato:&#10;13.80 V → 100.0 %&#10;13.79 V → 99.9 %&#10;..."
                value={tableText}
                onChange={(e) => setTableText(e.target.value)}
                className="h-32 font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleImportTable} className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
                <Button onClick={handleExportTable} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tabla Actual</h3>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                <div className="space-y-1 font-mono text-xs">
                  {currentProfile.voltageSOCTable.slice(0, 10).map((entry, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{entry.voltage.toFixed(2)} V</span>
                      <span>→</span>
                      <span>{entry.soc.toFixed(1)} %</span>
                    </div>
                  ))}
                  {currentProfile.voltageSOCTable.length > 10 && (
                    <div className="text-center text-muted-foreground pt-2">
                      ... y {currentProfile.voltageSOCTable.length - 10} entradas más
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Perfil Actual</h3>
              <Select value={currentProfileId} onValueChange={setCurrentProfile}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Crear Nuevo Perfil</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre del perfil"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                />
                <Button onClick={handleCreateProfile} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Acciones del Perfil</h3>
              <div className="flex gap-2">
                <Button onClick={handleExportProfile} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                {profiles.length > 1 && (
                  <Button 
                    onClick={() => deleteProfile(currentProfileId)} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={() => {
                  resetToDefaults();
                  window.location.reload();
                }} 
                variant="secondary" 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restablecer Valores Predeterminados
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Lista de Perfiles</h3>
              <div className="space-y-2">
                {profiles.map(profile => (
                  <div 
                    key={profile.id} 
                    className={`flex justify-between items-center p-2 rounded-lg border ${
                      profile.id === currentProfileId ? 'bg-primary/10 border-primary' : ''
                    }`}
                  >
                    <span className="text-sm font-medium">{profile.name}</span>
                    <div className="flex gap-1">
                      {profile.id === currentProfileId && (
                        <Badge variant="default" className="text-xs">Activo</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}