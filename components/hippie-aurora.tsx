'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieAurora() {
  const { appTheme } = useBatteryStore();

  // Solo mostrar en tema hippie
  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Aurora Background Gradients */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(233, 30, 99, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(255, 111, 0, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 60% 30%, rgba(76, 175, 80, 0.12) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(156, 39, 176, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(0, 188, 212, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 80%, rgba(233, 30, 99, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 111, 0, 0.12) 0%, transparent 50%), radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.08) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 20%, rgba(156, 39, 176, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(233, 30, 99, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 60%, rgba(255, 111, 0, 0.08) 0%, transparent 50%)'
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Color Blobs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(156, 39, 176, 0.3) 0%, rgba(233, 30, 99, 0.2) 50%, transparent 70%)',
          filter: 'blur(40px)'
        }}
        animate={{
          x: ['-10%', '110%', '-10%'],
          y: ['20%', '60%', '20%'],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255, 111, 0, 0.4) 0%, rgba(76, 175, 80, 0.2) 50%, transparent 70%)',
          filter: 'blur(35px)'
        }}
        animate={{
          x: ['110%', '-10%', '110%'],
          y: ['70%', '10%', '70%'],
          scale: [0.8, 1.3, 1, 0.8]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10
        }}
      />

      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(0, 188, 212, 0.3) 0%, rgba(156, 39, 176, 0.2) 50%, transparent 70%)',
          filter: 'blur(30px)'
        }}
        animate={{
          x: ['50%', '20%', '80%', '50%'],
          y: ['10%', '80%', '30%', '10%'],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 20
        }}
      />
    </div>
  );
}