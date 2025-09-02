'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConsumptionSegments, type ConsumptionSegment } from '@/lib/hooks/use-consumption-segments';
import { Clock, Edit2, Loader2, Plus, Save, Trash2, X, Zap } from 'lucide-react';
import React, { useState } from 'react';

// Colores disponibles para los tramos
const AVAILABLE_COLORS = [
  'bg-green-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
];

export function ConsumptionEditorNew() {
  const { 
    segments, 
    isLoading, 
    addSegment, 
    updateSegment, 
    deleteSegment,
    isAdding,
    isUpdating,
    isDeleting 
  } = useConsumptionSegments();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<ConsumptionSegment>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTramo, setNewTramo] = useState<Partial<ConsumptionSegment>>({
    name: '',
    segment_id: '',
    start_hour: 0,
    end_hour: 1,
    watts: 10,
    color: 'bg-blue-500'
  });

  const startEdit = (segment: ConsumptionSegment) => {
    setEditingId(segment.id);
    setEditingData({
      name: segment.name,
      segment_id: segment.segment_id,
      start_hour: segment.start_hour,
      end_hour: segment.end_hour,
      watts: segment.watts,
      color: segment.color
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveEdit = () => {
    if (!editingId || !editingData) return;
    
    // Calcular campos derivados
    const hours = editingData.end_hour === 0 
      ? 24 - (editingData.start_hour || 0)
      : editingData.end_hour === editingData.start_hour 
        ? 24 
        : (editingData.end_hour || 0) - (editingData.start_hour || 0);
    
    const wh = (editingData.watts || 0) * hours;
    const ah = wh / 12.8;
    
    updateSegment({
      id: editingId,
      ...editingData,
      hours,
      wh,
      ah,
      period_label: `${String(editingData.start_hour).padStart(2, '0')}:00-${String(editingData.end_hour).padStart(2, '0')}:00`
    });
    
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (segments.length <= 1) {
      return; // No permitir eliminar el último tramo
    }
    deleteSegment(id);
  };

  const handleAddNew = () => {
    if (!newTramo.name || !newTramo.segment_id) return;
    
    // Calcular campos derivados
    const hours = newTramo.end_hour === 0 
      ? 24 - (newTramo.start_hour || 0)
      : newTramo.end_hour === newTramo.start_hour 
        ? 24 
        : (newTramo.end_hour || 0) - (newTramo.start_hour || 0);
    
    const wh = (newTramo.watts || 0) * hours;
    const ah = wh / 12.8;
    
    addSegment({
      name: newTramo.name || '',
      segment_id: newTramo.segment_id || `custom-${Date.now()}`,
      start_hour: newTramo.start_hour || 0,
      end_hour: newTramo.end_hour || 1,
      watts: newTramo.watts || 0,
      hours,
      wh,
      ah,
      color: newTramo.color || 'bg-blue-500',
      period_label: `${String(newTramo.start_hour).padStart(2, '0')}:00-${String(newTramo.end_hour).padStart(2, '0')}:00`,
      is_active: true
    });
    
    // Resetear el formulario
    setNewTramo({
      name: '',
      segment_id: '',
      start_hour: 0,
      end_hour: 1,
      watts: 10,
      color: 'bg-blue-500'
    });
    setIsAddingNew(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Tramos de Consumo</h3>
        {!isAddingNew && (
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Formulario para agregar nuevo tramo */}
      {isAddingNew && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="new-name" className="text-xs">Nombre</Label>
                <Input
                  id="new-name"
                  value={newTramo.name}
                  onChange={(e) => setNewTramo({ ...newTramo, name: e.target.value })}
                  placeholder="Ej: Refrigerador"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="new-id" className="text-xs">ID</Label>
                <Input
                  id="new-id"
                  value={newTramo.segment_id}
                  onChange={(e) => setNewTramo({ ...newTramo, segment_id: e.target.value })}
                  placeholder="Ej: refri"
                  className="h-8"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="new-start" className="text-xs">Hora Inicio</Label>
                <Input
                  id="new-start"
                  type="number"
                  min="0"
                  max="23"
                  value={newTramo.start_hour}
                  onChange={(e) => setNewTramo({ ...newTramo, start_hour: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="new-end" className="text-xs">Hora Fin</Label>
                <Input
                  id="new-end"
                  type="number"
                  min="0"
                  max="24"
                  value={newTramo.end_hour}
                  onChange={(e) => setNewTramo({ ...newTramo, end_hour: parseInt(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="new-watts" className="text-xs">Watts</Label>
                <Input
                  id="new-watts"
                  type="number"
                  min="0"
                  value={newTramo.watts}
                  onChange={(e) => setNewTramo({ ...newTramo, watts: parseFloat(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Color</Label>
              <div className="flex gap-1 mt-1">
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTramo({ ...newTramo, color })}
                    className={`w-6 h-6 rounded ${color} ${newTramo.color === color ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewTramo({
                    name: '',
                    segment_id: '',
                    start_hour: 0,
                    end_hour: 1,
                    watts: 10,
                    color: 'bg-blue-500'
                  });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAddNew}
                disabled={!newTramo.name || !newTramo.segment_id || isAdding}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Guardar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de tramos existentes */}
      <div className="space-y-2">
        {segments.map((segment) => (
          <Card key={segment.id} className="p-3">
            {editingId === segment.id ? (
              // Modo edición
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`edit-name-${segment.id}`} className="text-xs">Nombre</Label>
                    <Input
                      id={`edit-name-${segment.id}`}
                      value={editingData.name}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-watts-${segment.id}`} className="text-xs">Watts</Label>
                    <Input
                      id={`edit-watts-${segment.id}`}
                      type="number"
                      min="0"
                      value={editingData.watts}
                      onChange={(e) => setEditingData({ ...editingData, watts: parseFloat(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`edit-start-${segment.id}`} className="text-xs">Hora Inicio</Label>
                    <Input
                      id={`edit-start-${segment.id}`}
                      type="number"
                      min="0"
                      max="23"
                      value={editingData.start_hour}
                      onChange={(e) => setEditingData({ ...editingData, start_hour: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-end-${segment.id}`} className="text-xs">Hora Fin</Label>
                    <Input
                      id={`edit-end-${segment.id}`}
                      type="number"
                      min="0"
                      max="24"
                      value={editingData.end_hour}
                      onChange={(e) => setEditingData({ ...editingData, end_hour: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-1 mt-1">
                    {AVAILABLE_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditingData({ ...editingData, color })}
                        className={`w-6 h-6 rounded ${color} ${editingData.color === color ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={saveEdit} disabled={isUpdating}>
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Guardar
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                  <div>
                    <div className="font-medium text-sm">{segment.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {segment.period_label}
                      <Zap className="h-3 w-3 ml-1" />
                      {segment.watts}W
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEdit(segment)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(segment.id)}
                    disabled={segments.length <= 1 || isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay tramos de consumo configurados</p>
          <p className="text-sm mt-1">Agrega un tramo para comenzar</p>
        </div>
      )}
    </div>
  );
}