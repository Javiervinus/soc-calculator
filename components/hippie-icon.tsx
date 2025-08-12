'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';
import { ReactNode } from 'react';

interface HippieIconProps {
  children: ReactNode;
  className?: string;
  variant?: 'pulse' | 'rainbow' | 'float' | 'spin';
}

export function HippieIcon({ children, className = '', variant = 'pulse' }: HippieIconProps) {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') {
    return <div className={className}>{children}</div>;
  }

  const getAnimation = () => {
    switch (variant) {
      case 'pulse':
        return {
          scale: [1, 1.1, 1],
          filter: [
            'hue-rotate(0deg) saturate(1)',
            'hue-rotate(60deg) saturate(1.2)',
            'hue-rotate(0deg) saturate(1)'
          ]
        };
      case 'rainbow':
        return {
          filter: [
            'hue-rotate(0deg)',
            'hue-rotate(360deg)',
            'hue-rotate(0deg)'
          ]
        };
      case 'float':
        return {
          y: [0, -8, 0],
          rotate: [0, 5, -5, 0]
        };
      case 'spin':
        return {
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        };
      default:
        return {};
    }
  };

  const getDuration = () => {
    switch (variant) {
      case 'pulse': return 3;
      case 'rainbow': return 4;
      case 'float': return 6;
      case 'spin': return 8;
      default: return 3;
    }
  };

  return (
    <motion.div
      className={className}
      animate={getAnimation()}
      transition={{
        duration: getDuration(),
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}