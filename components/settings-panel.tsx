'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Download, Upload, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useBatteryStore } from '@/lib/store';
import { VoltageSOCEntry } from '@/lib/battery-data';

export function SettingsPanel() {
  const { 
    profiles, 
    currentProfileId, 
    getCurrentProfile,
    setCurrentProfile,
    createProfile,
    deleteProfile,
    updateBatteryConfig,
    updateVoltageSOCTable,
    resetToDefaults,
  } = useBatteryStore();

  const currentProfile = getCurrentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [tableText, setTableText] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

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
    };
    
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-${currentProfile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configuración</SheetTitle>
          <SheetDescription>
            Ajusta los parámetros de la batería y gestiona perfiles
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="battery" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="battery">Batería</TabsTrigger>
            <TabsTrigger value="table">Tabla V→SOC</TabsTrigger>
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