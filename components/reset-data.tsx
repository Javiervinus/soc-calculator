'use client';

import { useEffect } from 'react';
import { useBatteryStore } from '@/lib/store';

export function ResetData() {
  const { resetToDefaults } = useBatteryStore();

  useEffect(() => {
    // Verificar si los datos almacenados tienen el valor incorrecto de 105W
    const storedData = localStorage.getItem('battery-storage');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const hasOldData = JSON.stringify(parsed).includes('105');
        
        if (hasOldData) {
          console.log('Datos antiguos detectados, actualizando a valores correctos...');
          resetToDefaults();
          // Forzar recarga para asegurar que se usen los nuevos valores
          window.location.reload();
        }
      } catch (e) {
        console.error('Error parsing stored data:', e);
      }
    }
  }, [resetToDefaults]);

  return null;
}