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
import { Download, Moon, Plus, RefreshCw, Save, Settings, Sun, Trash2, Upload } from 'lucide-react';
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
  } = useBatteryStore();

  const currentProfile = getCurrentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [tableText, setTableText] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [importSOCText, setImportSOCText] = useState('');

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
    
    // Crear CSV con el histórico
    const csvContent = [
      ['Fecha', 'Hora', 'SOC (%)'].join(','),
      ...history.map(entry => {
        const date = new Date(entry.timestamp);
        return [
          date.toLocaleDateString('es-EC'),
          date.toLocaleTimeString('es-EC'),
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
            // Parsear fecha (formato M/D/YYYY o MM/DD/YYYY)
            const dateParts = dateStr.split('/');
            if (dateParts.length === 3) {
              const month = parseInt(dateParts[0]) - 1; // Meses en JS son 0-indexed
              const day = parseInt(dateParts[1]);
              const year = parseInt(dateParts[2]);
              
              // Parsear hora (formato "5:00:00 p. m." o "17:00:00")
              let hour = 17; // Por defecto 5 PM
              let minute = 0;
              
              if (timeStr) {
                // Remover espacios extras y normalizar
                const timeCleaned = timeStr.replace(/\s+/g, ' ').trim();
                const isPM = timeCleaned.toLowerCase().includes('p.m.') || timeCleaned.toLowerCase().includes('pm');
                const isAM = timeCleaned.toLowerCase().includes('a.m.') || timeCleaned.toLowerCase().includes('am');
                
                // Extraer horas y minutos
                const timeMatch = timeCleaned.match(/(\d{1,2}):(\d{2})/);
                if (timeMatch) {
                  hour = parseInt(timeMatch[1]);
                  minute = parseInt(timeMatch[2]);
                  
                  // Convertir a formato 24 horas
                  if (isPM && hour !== 12) {
                    hour += 12;
                  } else if (isAM && hour === 12) {
                    hour = 0;
                  }
                }
              }
              
              const date = new Date(year, month, day, hour, minute);
              
              if (!isNaN(date.getTime())) {
                // Verificar si ya existe una entrada para esa fecha
                const dateKey = date.toISOString().split('T')[0];
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
        
        // Verificar si alguna entrada es del día de hoy
        const today = new Date().toISOString().split('T')[0];
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

        <Tabs defaultValue="battery" className="mt-6 px-6">
          <TabsList className="grid w-full grid-cols-5 dark:bg-gray-900 text-xs">
            <TabsTrigger value="battery">Batería</TabsTrigger>
            <TabsTrigger value="consumption">Consumo</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="table">Tabla</TabsTrigger>
            <TabsTrigger value="profiles">Perfiles</TabsTrigger>
          </TabsList>

          <TabsContent value="battery" className="space-y-6">
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
              <h3 className="font-semibold">Información del Sistema</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Química</span>
                  <span>{currentProfile.batteryConfig.chemistry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voltaje Nominal</span>
                  <span>{currentProfile.batteryConfig.nominalVoltage} V</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zona Horaria</span>
                  <span>{currentProfile.batteryConfig.timezone}</span>
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
                  placeholder="Pega aquí datos CSV:☯☸Fecha,Hora,SOC(%)☯☸6/29/2025,5:00:00 p. m.,90☯☸7/15/2025,17:00,100☯☸01/01/2024,16:30,85"
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