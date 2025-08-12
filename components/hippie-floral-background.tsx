'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieFloralBackground() {
  const { appTheme } = useBatteryStore();

  // Solo mostrar en tema hippie
  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Formas florales orgánicas - pétalos */}
      {[...Array(8)].map((_, index) => (
        <motion.div
          key={`petal-${index}`}
          className="absolute"
          style={{
            left: `${15 + (index * 12)}%`,
            top: `${20 + (index * 8)}%`,
            width: `${40 + index * 10}px`,
            height: `${60 + index * 15}px`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -5, 0],
            rotate: [0, 15, -10, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 20 + index * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 3
          }}
        >
          {/* Pétalo individual */}
          <div
            className="w-full h-full opacity-20"
            style={{
              background: `radial-gradient(ellipse 50% 80% at 50% 20%, 
                rgba(156, 39, 176, 0.15) 0%, 
                rgba(233, 30, 99, 0.1) 40%, 
                transparent 70%)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              transform: `rotate(${index * 45}deg)`
            }}
          />
        </motion.div>
      ))}

      {/* Hojas flotantes */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={`leaf-${index}`}
          className="absolute"
          style={{
            right: `${10 + (index * 15)}%`,
            top: `${25 + (index * 12)}%`,
            width: `${30 + index * 8}px`,
            height: `${50 + index * 10}px`,
          }}
          animate={{
            y: [0, -15, 5, 0],
            x: [0, -8, 12, 0],
            rotate: [0, -20, 25, 0],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{
            duration: 25 + index * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 4 + 10
          }}
        >
          {/* Hoja orgánica */}
          <div
            className="w-full h-full opacity-15"
            style={{
              background: `linear-gradient(135deg, 
                rgba(76, 175, 80, 0.12) 0%, 
                rgba(255, 111, 0, 0.1) 50%, 
                transparent 80%)`,
              borderRadius: '0% 100% 0% 100% / 0% 80% 20% 100%',
              transform: `rotate(${index * 30}deg)`
            }}
          />
        </motion.div>
      ))}

      {/* Ondas suaves de fondo */}
      <motion.div
        className="absolute inset-0 opacity-4"
        style={{
          background: `radial-gradient(ellipse 800px 400px at 30% 60%, 
            rgba(156, 39, 176, 0.03) 0%, 
            transparent 50%), 
            radial-gradient(ellipse 600px 300px at 70% 40%, 
            rgba(76, 175, 80, 0.02) 0%, 
            transparent 50%)`
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.04, 0.08, 0.04]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Círculos orgánicos respirando */}
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={`organic-circle-${index}`}
          className="absolute rounded-full opacity-10"
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + index * 15}%`,
            width: `${80 + index * 40}px`,
            height: `${80 + index * 40}px`,
            background: `radial-gradient(circle, 
              rgba(${index % 2 === 0 ? '233, 30, 99' : '76, 175, 80'}, 0.12) 0%, 
              transparent 60%)`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 40 + index * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 8
          }}
        />
      ))}

      {/* Textura sutil de fondo - como hierba o musgo */}
      <div
        className="absolute inset-0 opacity-2"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.02) 2px, transparent 2px),
            radial-gradient(circle at 80% 50%, rgba(156, 39, 176, 0.015) 1px, transparent 1px),
            radial-gradient(circle at 40% 70%, rgba(255, 111, 0, 0.01) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 80px 80px, 40px 40px',
          backgroundPosition: '0 0, 30px 30px, 20px 20px'
        }}
      />
    </div>
  );
}