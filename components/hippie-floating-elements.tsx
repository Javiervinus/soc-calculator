'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieFloatingElements() {
  const { appTheme } = useBatteryStore();

  // Solo mostrar en tema hippie
  if (appTheme !== 'hippie') return null;

  const elements = [
    { symbol: '✦', size: 'text-lg', delay: 0 },
    { symbol: '❋', size: 'text-base', delay: 5 },
    { symbol: '✧', size: 'text-sm', delay: 10 },
    { symbol: '❈', size: 'text-lg', delay: 15 },
    { symbol: '✦', size: 'text-xs', delay: 20 },
    { symbol: '❋', size: 'text-base', delay: 25 },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.size} opacity-10`}
          style={{
            left: `${10 + (index * 15)}%`,
            top: `${15 + (index * 10)}%`,
            color: ['#9c27b0', '#e91e63', '#ff6f00', '#4caf50', '#00bcd4'][index % 5]
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.05, 0.15, 0.05, 0.1]
          }}
          transition={{
            duration: 25 + index * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay
          }}
        >
          {element.symbol}
        </motion.div>
      ))}

      {/* Formas geométricas sutiles */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={`geo-${i}`}
          className="absolute w-4 h-4 opacity-5"
          style={{
            right: `${5 + i * 20}%`,
            top: `${30 + i * 15}%`,
            background: `conic-gradient(from 0deg, transparent, ${['#9c27b0', '#e91e63', '#ff6f00'][i - 1]}, transparent)`,
            borderRadius: i === 2 ? '50%' : '0%'
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.02, 0.08, 0.02, 0.05]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 8
          }}
        />
      ))}
    </div>
  );
}