'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';
import { ReactNode } from 'react';

interface HippieTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'rainbow' | 'glow' | 'wave';
}

export function HippieText({ children, className = '', variant = 'rainbow' }: HippieTextProps) {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') {
    return <span className={className}>{children}</span>;
  }

  const getStyle = () => {
    switch (variant) {
      case 'rainbow':
        return {
          background: 'linear-gradient(90deg, #9c27b0, #e91e63, #ff6f00, #4caf50, #00bcd4, #9c27b0)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
      case 'glow':
        return {
          color: '#e91e63',
          textShadow: '0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(156, 39, 176, 0.3)'
        };
      case 'wave':
        return {
          background: 'linear-gradient(45deg, #9c27b0, #e91e63, #ff6f00)',
          backgroundSize: '300% 300%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        };
      default:
        return {};
    }
  };

  const getAnimation = () => {
    switch (variant) {
      case 'rainbow':
        return {
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        };
      case 'glow':
        return {
          textShadow: [
            '0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(156, 39, 176, 0.3)',
            '0 0 15px rgba(255, 111, 0, 0.6), 0 0 25px rgba(233, 30, 99, 0.4)',
            '0 0 10px rgba(233, 30, 99, 0.5), 0 0 20px rgba(156, 39, 176, 0.3)'
          ]
        };
      case 'wave':
        return {
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        };
      default:
        return {};
    }
  };

  return (
    <motion.span
      className={className}
      style={getStyle()}
      animate={getAnimation()}
      transition={{
        duration: variant === 'rainbow' ? 5 : variant === 'glow' ? 3 : 7,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.span>
  );
}