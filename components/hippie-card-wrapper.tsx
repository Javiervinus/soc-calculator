'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';
import { ReactNode } from 'react';

interface HippieCardWrapperProps {
  children: ReactNode;
  className?: string;
}

export function HippieCardWrapper({ children, className = '' }: HippieCardWrapperProps) {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="relative">
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] p-[2px]"
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
      />
      
      <motion.div
        className={`relative bg-card rounded-[2rem] overflow-hidden ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Animated radial patterns - siempre visibles */}
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
        {/* Radial pattern 1 */}
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(156, 39, 176, 0.1) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
          animate={{
            x: ['10%', '80%', '10%'],
            y: ['20%', '70%', '20%'],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Radial pattern 2 */}
        <motion.div
          className="absolute w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(233, 30, 99, 0.08) 0%, transparent 70%)',
            filter: 'blur(6px)'
          }}
          animate={{
            x: ['70%', '20%', '70%'],
            y: ['60%', '10%', '60%'],
            scale: [1, 0.7, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Radial pattern 3 */}
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 111, 0, 0.06) 0%, transparent 70%)',
            filter: 'blur(4px)'
          }}
          animate={{
            x: ['40%', '60%', '40%'],
            y: ['30%', '80%', '30%'],
            scale: [0.9, 1.1, 0.9]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </motion.div>

        {children}
      </motion.div>
    </div>
  );
}