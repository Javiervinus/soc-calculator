'use client';

import { useState, useEffect } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Queremos refetch en background tras hidratar → mantener stale
          staleTime: 0, 
          // Debe ser >= maxAge del persist (24h)
          gcTime: 1000 * 60 * 60 * 24, // 24h en memoria
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
          refetchOnMount: 'always', // Siempre refetch al montar si está stale
          retry: 1,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  );

  // Detectar hidratación del lado cliente
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const persister = createAsyncStoragePersister({
    // Soporta storages "async" y también sync como localStorage
    storage: typeof window !== 'undefined'
      ? {
          getItem: (k) => Promise.resolve(window.localStorage.getItem(k)),
          setItem: (k, v) => Promise.resolve(window.localStorage.setItem(k, v)),
          removeItem: (k) => Promise.resolve(window.localStorage.removeItem(k)),
        }
      : undefined,
    key: 'soc-calculator-cache',
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24h guardado en localStorage  
        buster: 'cache-v1-2025-09-01',
      }}
      onSuccess={() => {
        console.log('🎉 [CACHE] Cache restored from localStorage - data available instantly!');
        setIsHydrated(true); // Marcar como hidratado
        
        // Debug: mostrar qué queries se restauraron
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();
        console.log('📋 [CACHE] Restored queries count:', queries.length);
        
        queries.forEach((q) => {
          console.log(`📋 [CACHE] Query restored:`, {
            key: q.queryKey,
            data: q.state.data,
            status: q.state.status,
            timestamp: q.state.dataUpdatedAt ? new Date(q.state.dataUpdatedAt).toLocaleTimeString() : 'Never',
            isStale: q.isStale()
          });
        });
        
        // Debug específico para voltage
        const voltageQuery = cache.find({ queryKey: ['voltage', 'd51dbd52-d285-415b-b99f-ab399e828dff'] });
        if (voltageQuery?.state) {
          console.log('🔋 [VOLTAGE] Cache restored with value:', voltageQuery.state.data);
        } else {
          console.log('🔋 [VOLTAGE] No cache found, will use SSR data');
        }
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}