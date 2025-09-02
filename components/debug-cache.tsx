'use client';

import { useEffect, useState } from 'react';

export function DebugCache() {
  const [cacheData, setCacheData] = useState<string>('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const cache = localStorage.getItem('soc-calculator-cache');
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          setCacheData(JSON.stringify(parsed, null, 2).substring(0, 500) + '...');
        } catch (e) {
          setCacheData('Error parsing cache');
        }
      } else {
        setCacheData('No cache found in localStorage');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 max-w-md p-4 bg-black/80 text-white text-xs font-mono rounded-lg overflow-auto max-h-64 z-50">
      <div className="font-bold mb-2">React Query Cache Debug:</div>
      <pre className="whitespace-pre-wrap">{cacheData}</pre>
    </div>
  );
}