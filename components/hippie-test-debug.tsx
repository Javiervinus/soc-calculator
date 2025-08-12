'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieTestDebug() {
  const { appTheme } = useBatteryStore();

  // Solo mostrar en tema hippie
  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      {/* Test muy visible - círculo rojo que se mueve */}
      <motion.div
        className="absolute top-20 left-20 w-20 h-20 bg-red-500 opacity-80 rounded-full"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Test muy visible - cuadrado azul */}
      <motion.div
        className="absolute bottom-20 right-20 w-16 h-16 bg-blue-500 opacity-70"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Test muy visible - línea verde que crece */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '4px',
          height: '100px',
          background: 'linear-gradient(to top, #00ff00, transparent)',
          opacity: 0.8
        }}
        animate={{
          scaleY: [1, 2, 1],
          x: [0, 20, -20, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Test de texto visible */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-red-600 text-2xl font-bold opacity-90 pointer-events-none">
        🌸 HIPPIE TEST - ¿VES ESTO? 🌸
      </div>
    </div>
  );
}