'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConsumptionTramo } from '@/lib/battery-data';
import { useBatteryStore } from '@/lib/store';
import { Clock, Edit2, Plus, Save, Trash2, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function ConsumptionEditor() {
  const { getCurrentProfile, updateConsumptionTramo, deleteConsumptionTramo, addConsumptionTramo, updateConsumptionTramos } = useBatteryStore();
  const currentProfile = getCurrentProfile();
  
  // Migración automática si no existen tramos
  const tramos = currentProfile.consumptionTramos || [];
  
  // Si no hay tramos, inicializar con los valores por defecto
  React.useEffect(() => {
    if (!currentProfile.consumptionTramos || currentProfile.consumptionTramos.length === 0) {
      import('@/lib/battery-data').then(({ defaultConsumptionTramos }) => {
        updateConsumptionTramos(defaultConsumptionTramos);
      });
    }
  }, [currentProfile.consumptionTramos, updateConsumptionTramos]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ConsumptionTramo>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTramo, setNewTramo] = useState<Partial<ConsumptionTramo>>({
    name: '',
    startHour: 0,
    endHour: 1,
    watts: 10,
    color: 'bg-blue-500'
  });

  const startEdit = (tramo: ConsumptionTramo) => {
    setEditingId(tramo.id);
    setEditingData({
      name: tramo.name,
      startHour: tramo.startHour,
      endHour: tramo.endHour,
      watts: tramo.watts,
      color: tramo.color
    });
  };

  const saveEdit = () => {
    if (editingId && editingData) {
      updateConsumptionTramo(editingId, editingData);
      toast.success('Tramo actualizado');
      setEditingId(null);
      setEditingData({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleDelete = (id: string) => {
    if (tramos.length > 1) {
      deleteConsumptionTramo(id);
      toast.success('Tramo eliminado');
    } else {
      toast.error('Debe mantener al menos un tramo');
    }
  };

  const handleAddNew = () => {
    if (!newTramo.name || newTramo.startHour === undefined || newTramo.endHour === undefined || !newTramo.watts) {
      toast.error('Complete todos los campos');
      return;
    }

    if (newTramo.startHour === newTramo.endHour) {
      toast.error('La hora de fin debe ser diferente a la de inicio');
      return;
    }

    const hours = newTramo.endHour! >= newTramo.startHour! 
      ? newTramo.endHour! - newTramo.startHour!
      : (24 - newTramo.startHour!) + newTramo.endHour!;
    
    const wh = newTramo.watts! * hours;
    const ah = Number((wh / 12.8).toFixed(1));
    
    const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;
    const period = `${formatHour(newTramo.startHour!)}-${formatHour(newTramo.endHour! === 24 ? 0 : newTramo.endHour!)}`;

    const tramoToAdd: ConsumptionTramo = {
      id: `custom-${Date.now()}`,
      name: newTramo.name!,
      period,
      startHour: newTramo.startHour!,
      endHour: newTramo.endHour!,
      watts: newTramo.watts!,
      hours,
      wh,
      ah,
      color: newTramo.color || 'bg-gray-500'
    };

    addConsumptionTramo(tramoToAdd);
    toast.success('Tramo agregado');
    setIsAddingNew(false);
    setNewTramo({
      name: '',
      startHour: 0,
      endHour: 1,
      watts: 10,
      color: 'bg-blue-500'
    });
  };

  const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  // Calcular totales
  const totals = tramos.length > 0 
    ? tramos.reduce((acc, t) => ({
        wh: acc.wh + t.wh,
        ah: acc.ah + t.ah
      }), { wh: 0, ah: 0 })
    : { wh: 0, ah: 0 };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Tramos de Consumo Nocturno</h3>
        {!isAddingNew && (
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="outline"
            className="h-7"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Nuevo tramo */}
      {isAddingNew && (
        <Card className="p-3 space-y-2 border-blue-500">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nombre</Label>
              <Input
                value={newTramo.name}
                onChange={(e) => setNewTramo({ ...newTramo, name: e.target.value })}
                placeholder="Ej: Tramo E"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Consumo (W)</Label>
              <Input
                type="number"
                value={newTramo.watts}
                onChange={(e) => setNewTramo({ ...newTramo, watts: Number(e.target.value) })}
                min={1}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Hora inicio</Label>
              <select
                value={newTramo.startHour}
                onChange={(e) => setNewTramo({ ...newTramo, startHour: Number(e.target.value) })}
                className="w-full h-8 text-xs border rounded px-2"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Hora fin</Label>
              <select
                value={newTramo.endHour}
                onChange={(e) => setNewTramo({ ...newTramo, endHour: Number(e.target.value) })}
                className="w-full h-8 text-xs border rounded px-2"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <option key={i} value={i}>{formatHour(i === 24 ? 0 : i)} {i === 24 ? '(día siguiente)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddNew} size="sm" className="h-7 flex-1">
              <Save className="h-3 w-3 mr-1" />
              Guardar
            </Button>
            <Button onClick={() => setIsAddingNew(false)} size="sm" variant="outline" className="h-7 flex-1">
              <X className="h-3 w-3 mr-1" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de tramos */}
      <div className="space-y-2">
        {tramos.length === 0 ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            Cargando tramos de consumo...
          </Card>
        ) : (
          tramos.map((tramo) => (
          <Card key={tramo.id} className="p-3">
            {editingId === tramo.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={editingData.name}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Consumo (W)</Label>
                    <Input
                      type="number"
                      value={editingData.watts}
                      onChange={(e) => setEditingData({ ...editingData, watts: Number(e.target.value) })}
                      min={1}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hora inicio</Label>
                    <select
                      value={editingData.startHour}
                      onChange={(e) => setEditingData({ ...editingData, startHour: Number(e.target.value) })}
                      className="w-full h-8 text-xs border rounded px-2"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Hora fin</Label>
                    <select
                      value={editingData.endHour}
                      onChange={(e) => setEditingData({ ...editingData, endHour: Number(e.target.value) })}
                      className="w-full h-8 text-xs border rounded px-2"
                    >
                      {Array.from({ length: 25 }, (_, i) => (
                        <option key={i} value={i}>{formatHour(i === 24 ? 0 : i)} {i === 24 ? '(día siguiente)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveEdit} size="sm" className="h-7 flex-1">
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline" className="h-7 flex-1">
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tramo.color}`} />
                    <span className="font-medium text-xs">{tramo.name}</span>
                    <span className="text-xs text-muted-foreground">{tramo.period}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {tramo.watts}W
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tramo.hours}h
                    </span>
                    <span>{tramo.wh} Wh</span>
                    <span>{tramo.ah} Ah</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => startEdit(tramo)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(tramo.id)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    disabled={tramos.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )))}
      </div>

      {/* Totales */}
      <Card className="p-3 bg-muted/50">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium">Total Ciclo</span>
          <div className="flex gap-3">
            <span className="font-mono">{totals.wh.toFixed(0)} Wh</span>
            <span className="font-mono">{totals.ah.toFixed(1)} Ah</span>
          </div>
        </div>
      </Card>
    </div>
  );
}