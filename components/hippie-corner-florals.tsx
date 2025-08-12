'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

interface HippieCornerFloralsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function HippieCornerFlorals({ position = 'top-right' }: HippieCornerFloralsProps) {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-2 left-2';
      case 'top-right': return 'top-2 right-2';
      case 'bottom-left': return 'bottom-2 left-2';
      case 'bottom-right': return 'bottom-2 right-2';
      default: return 'top-2 right-2';
    }
  };

  return (
    <div className={`absolute ${getPositionClasses()} pointer-events-none`}>
      {/* Flor pequeña con pétalos */}
      <motion.div
        className="relative w-6 h-6"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Centro de la flor */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(255, 111, 0, 0.6) 0%, transparent 70%)'
          }}
        />
        
        {/* Pétalos */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-2 opacity-30"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: 'center',
              transform: `translate(-50%, -50%) rotate(${i * 72}deg) translateY(-8px)`,
              background: `linear-gradient(ellipse, 
                rgba(156, 39, 176, 0.4) 0%, 
                rgba(233, 30, 99, 0.3) 50%, 
                transparent 80%)`,
              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>

      {/* Hojitas pequeñas alrededor */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute w-2 h-3 opacity-25"
          style={{
            top: `${i * 8}px`,
            left: `${-4 + i * 2}px`,
            background: `linear-gradient(135deg, 
              rgba(76, 175, 80, 0.3) 0%, 
              transparent 70%)`,
            borderRadius: '0% 100% 0% 100% / 0% 70% 30% 100%',
            transform: `rotate(${i * 45 - 20}deg)`
          }}
          animate={{
            rotate: [i * 45 - 20, i * 45 + 10, i * 45 - 20],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
        />
      ))}
    </div>
  );
}