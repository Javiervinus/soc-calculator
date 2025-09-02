'use client';

import { useRef, useCallback } from 'react';

/**
 * Hook para debounce de mutaciones
 * Actualiza la UI inmediatamente pero retrasa el guardado en DB
 */
export function useDebouncedMutation<T extends (...args: any[]) => void>(
  mutationFn: T,
  delay: number = 800
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedMutation = useCallback((...args: Parameters<T>) => {
    // Cancelar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      mutationFn(...args);
    }, delay);
  }, [mutationFn, delay]) as T;
  
  return debouncedMutation;
}