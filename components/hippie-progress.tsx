'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

interface HippieProgressProps {
  value: number;
  className?: string;
}

export function HippieProgress({ value, className = '' }: HippieProgressProps) {
  const { appTheme } = useBatteryStore();

  // Si no es tema hippie, usar progress normal
  if (appTheme !== 'hippie') {
    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }

  // Progress hippie con gradiente animado
  return (
    <div className={`relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className="h-2 rounded-full relative overflow-hidden"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Gradiente base */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #9c27b0, #e91e63, #ff6f00, #4caf50, #00bcd4)'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Brillo animado */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            backgroundSize: '50% 100%'
          }}
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>
    </div>
  );
}