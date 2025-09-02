'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDailySOC } from '@/lib/hooks/use-daily-soc';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { AlertTriangle, Calendar, Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { CURRENT_BATTERY_PROFILE_ID } from '@/lib/constants/user-constants';
import { useQueryClient } from '@tanstack/react-query';
import { getTodayEcuadorDateString } from '@/lib/timezone-utils';

export function SOCHistoryTab() {
  const { history, isLoadingHistory } = useDailySOC();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; date: string } | null>(null);
  const queryClient = useQueryClient();

  const handleExportHistory = () => {
    if (history.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    // Crear CSV con el histórico
    const csvContent = [
      ['Fecha', 'Hora', 'SOC (%)', 'Voltaje (V)'].join(','),
      ...history.map(entry => {
        const date = new Date(entry.date);
        const createdAt = new Date(entry.created_at || entry.date);
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = createdAt.getHours().toString().padStart(2, '0');
        const minutes = createdAt.getMinutes().toString().padStart(2, '0');
        
        return [
          `${year}-${month}-${day}`,
          `${hours}:${minutes}`,
          entry.soc,
          entry.voltage || ''
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
    
    toast.success(`Exportados ${history.length} registros`);
  };

  const openDeleteDialog = (id: string, date: string) => {
    setRecordToDelete({ id, date });
    setDeleteDialogOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (!recordToDelete) return;
    
    setIsDeletingId(recordToDelete.id);
    setDeleteDialogOpen(false);
    const supabase = getSupabase();
    
    try {
      const { error } = await supabase
        .from('daily_soc_records')
        .delete()
        .eq('id', recordToDelete.id);
      
      if (error) throw error;
      
      // Invalidar queries para actualizar
      queryClient.invalidateQueries({ 
        queryKey: ['daily-soc', CURRENT_BATTERY_PROFILE_ID, getTodayEcuadorDateString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['daily-soc-history', CURRENT_BATTERY_PROFILE_ID] 
      });
      
      toast.success('Registro eliminado');
    } catch (error) {
      console.error('Error eliminando registro:', error);
      toast.error('Error al eliminar el registro');
    } finally {
      setIsDeletingId(null);
      setRecordToDelete(null);
    }
  };


  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Ordenar por fecha descendente para mostrar los más recientes primero
  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico de SOC
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {history.length} {history.length === 1 ? 'registro' : 'registros'} guardados
          </p>
        </div>
        <Button 
          onClick={handleExportHistory} 
          size="sm" 
          variant="outline"
          disabled={history.length === 0}
        >
          <Download className="h-4 w-4 mr-1" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabla de histórico */}
      {history.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">SOC</TableHead>
                <TableHead className="text-center">Voltaje</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHistory.map((entry) => {
                const isDeleting = isDeletingId === entry.id;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {formatInTimeZone(
                        `${entry.date}T00:00:00`, 
                        'America/Guayaquil', 
                        'dd MMM yyyy', 
                        { locale: es }
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-full text-xs font-medium ${
                        entry.soc >= 70 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : entry.soc >= 40 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {entry.soc}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.voltage ? (
                        <span className="text-sm font-mono">
                          {entry.voltage.toFixed(2)}V
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(entry.id, entry.date)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay registros de SOC guardados</p>
          <p className="text-xs mt-1">Los registros aparecerán aquí cuando guardes tu SOC diario</p>
        </div>
      )}

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription className="pt-3">
              ¿Estás seguro de que quieres eliminar el registro del{' '}
              <span className="font-semibold">
                {recordToDelete && formatInTimeZone(
                  `${recordToDelete.date}T00:00:00`, 
                  'America/Guayaquil', 
                  'dd \'de\' MMMM \'de\' yyyy', 
                  { locale: es }
                )}
              </span>?
              <br />
              <br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEntry}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}