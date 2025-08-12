'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieIncenseSwirls() {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Swirls como humo de incienso */}
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={`swirl-${index}`}
          className="absolute opacity-15"
          style={{
            left: `${20 + index * 20}%`,
            bottom: '10%',
            width: '2px',
            height: '200px',
          }}
        >
          {/* Línea de humo serpenteante */}
          <motion.div
            className="w-full h-full"
            style={{
              background: `linear-gradient(to top, 
                rgba(156, 39, 176, 0.2) 0%, 
                rgba(233, 30, 99, 0.15) 40%, 
                rgba(76, 175, 80, 0.1) 70%, 
                transparent 100%)`,
              borderRadius: '50%',
              filter: 'blur(1px)'
            }}
            animate={{
              x: [0, 15, -10, 20, -5, 0],
              scaleX: [1, 1.5, 0.8, 1.2, 1],
              opacity: [0.15, 0.25, 0.2, 0.3, 0.15]
            }}
            transition={{
              duration: 25 + index * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 6
            }}
          />

          {/* Partículas de humo */}
          {[...Array(6)].map((_, particleIndex) => (
            <motion.div
              key={`particle-${particleIndex}`}
              className="absolute w-1 h-1 rounded-full opacity-20"
              style={{
                left: '50%',
                bottom: `${particleIndex * 30}px`,
                background: `rgba(${particleIndex % 2 === 0 ? '156, 39, 176' : '76, 175, 80'}, 0.3)`,
                transform: 'translateX(-50%)'
              }}
              animate={{
                x: [0, 8, -5, 10, 0],
                y: [0, -20, -40],
                scale: [0.5, 1, 0.3, 0],
                opacity: [0.2, 0.4, 0.15, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeOut",
                delay: index * 4 + particleIndex * 2
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Ondas relajantes muy sutiles */}
      <motion.div
        className="absolute inset-0 opacity-2"
        style={{
          background: `
            radial-gradient(ellipse 400px 200px at 25% 75%, rgba(156, 39, 176, 0.02) 0%, transparent 60%),
            radial-gradient(ellipse 300px 150px at 75% 25%, rgba(76, 175, 80, 0.015) 0%, transparent 60%)
          `
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 1, 0],
          opacity: [0.02, 0.04, 0.02]
        }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Respiración zen - círculos concéntricos */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={`zen-circle-${index}`}
            className="absolute rounded-full border opacity-3"
            style={{
              width: `${100 + index * 80}px`,
              height: `${100 + index * 80}px`,
              left: `${-50 - index * 40}px`,
              top: `${-50 - index * 40}px`,
              borderColor: index % 2 === 0 ? 'rgba(156, 39, 176, 0.05)' : 'rgba(76, 175, 80, 0.04)',
              borderWidth: '1px'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.08, 0.03],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 35 + index * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 8
            }}
          />
        ))}
      </div>
    </div>
  );
}