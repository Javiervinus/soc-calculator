'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';
import { ReactNode } from 'react';

interface HippieBorderProps {
  children: ReactNode;
  className?: string;
}

export function HippieBorder({ children, className = '' }: HippieBorderProps) {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-[inherit] p-[2px]"
        style={{
          background: 'linear-gradient(45deg, #9c27b0, #e91e63, #ff6f00, #4caf50, #00bcd4, #9c27b0)',
          backgroundSize: '400% 400%'
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="h-full w-full rounded-[inherit] bg-card">
          {children}
        </div>
      </motion.div>
    </div>
  );
}