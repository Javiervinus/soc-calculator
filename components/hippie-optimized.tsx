'use client';

import { motion } from 'framer-motion';
import { useUserPreferences } from '@/lib/hooks/use-user-preferences';
import { useMemo } from 'react';

// Constantes pre-calculadas para evitar re-renders
const HIBISCUS_POSITIONS = [
  { left: '10%', top: '15%' },
  { left: '35%', top: '35%' },
  { left: '60%', top: '55%' },
  { left: '85%', top: '75%' }
];

const PLUMERIA_POSITIONS = [
  { right: '5%', top: '10%' },
  { right: '20%', top: '25%' },
  { right: '35%', top: '40%' },
  { right: '50%', top: '55%' },
  { right: '65%', top: '70%' },
  { right: '80%', top: '85%' }
];

const PALM_LEAF_POSITIONS = [
  { left: '20%', bottom: '10%', rotation: -30 },
  { left: '40%', bottom: '20%', rotation: -15 },
  { left: '60%', bottom: '30%', rotation: 0 },
  { left: '80%', bottom: '40%', rotation: 15 },
  { right: '15%', bottom: '50%', rotation: 30 }
];

// Gradientes pre-definidos para hibisco y plumeria
const HIBISCUS_GRADIENT = 'linear-gradient(135deg, rgba(233, 30, 99, 0.6) 0%, rgba(156, 39, 176, 0.5) 50%, rgba(255, 111, 0, 0.4) 100%)';
const PLUMERIA_GRADIENT = 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 235, 59, 0.6) 50%, rgba(255, 193, 7, 0.5) 100%)';
const PALM_GRADIENT = 'linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.4) 20%, rgba(139, 195, 74, 0.5) 50%, rgba(76, 175, 80, 0.4) 80%, transparent 100%)';

export function HippieOptimized() {
  const { appTheme } = useUserPreferences();

  // Usar posiciones fijas para evitar problemas de hidratación
  // Los valores están pre-calculados para parecer aleatorios pero ser consistentes
  const floatingPetals = useMemo(() => [
    { id: 'petal-0', left: '12%', delay: 0, duration: 18 },
    { id: 'petal-1', left: '28%', delay: 2, duration: 22 },
    { id: 'petal-2', left: '45%', delay: 4, duration: 16 },
    { id: 'petal-3', left: '67%', delay: 6, duration: 20 },
    { id: 'petal-4', left: '83%', delay: 8, duration: 24 },
    { id: 'petal-5', left: '95%', delay: 10, duration: 19 }
  ], []);

  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Aurora de fondo optimizada - solo 1 elemento en lugar de 4 */}
      <motion.div
        className="absolute inset-0 opacity-8"
        style={{
          background: `
            radial-gradient(ellipse 400px 200px at 25% 75%, rgba(156, 39, 176, 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 300px 150px at 75% 25%, rgba(76, 175, 80, 0.02) 0%, transparent 60%)
          `
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.08, 0.12, 0.08]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Hibiscos optimizados - menos elementos DOM */}
      {HIBISCUS_POSITIONS.map((position, index) => (
        <motion.div
          key={`hibiscus-${index}`}
          className="absolute w-16 h-16"
          style={position}
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.03, 1]
          }}
          transition={{
            duration: 15 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 5
          }}
        >
          {/* Hibisco simplificado - 1 elemento en lugar de 5 pétalos */}
          <div
            className="w-full h-full rounded-full opacity-60"
            style={{
              background: HIBISCUS_GRADIENT,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-80"
            style={{
              background: 'radial-gradient(circle, rgba(255, 193, 7, 0.8) 0%, rgba(255, 111, 0, 0.6) 100%)'
            }}
          />
        </motion.div>
      ))}

      {/* Plumerias optimizadas */}
      {PLUMERIA_POSITIONS.slice(0, 3).map((position, index) => (
        <motion.div
          key={`plumeria-${index}`}
          className="absolute w-10 h-10"
          style={position}
          animate={{
            rotate: [0, 8, -8, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 18 + index * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 4
          }}
        >
          <div
            className="w-full h-full rounded-full opacity-70"
            style={{
              background: PLUMERIA_GRADIENT,
              clipPath: 'polygon(50% 0%, 80% 20%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)'
            }}
          />
        </motion.div>
      ))}

      {/* Hojas de palma optimizadas */}
      {PALM_LEAF_POSITIONS.slice(0, 3).map((position, index) => (
        <motion.div
          key={`palm-${index}`}
          className="absolute w-20 h-8"
          style={position}
          animate={{
            rotate: [position.rotation, position.rotation + 5, position.rotation - 5, position.rotation],
            x: [0, 8, -8, 0]
          }}
          transition={{
            duration: 20 + index * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 4
          }}
        >
          <div
            className="w-full h-full opacity-50"
            style={{
              background: PALM_GRADIENT,
              borderRadius: '0% 100% 100% 0%'
            }}
          />
        </motion.div>
      ))}

      {/* Pétalos flotantes memoizados */}
      {floatingPetals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute w-2 h-3 opacity-40"
          style={{
            left: petal.left,
            top: '-10px',
            background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.6) 0%, rgba(156, 39, 176, 0.4) 100%)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
          }}
          animate={{
            y: [0, '100vh'],
            x: [0, 15, -15, 15, 0],
            rotate: [0, 180, 360],
            scale: [1, 0.8, 1.2, 0.6]
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: petal.delay
          }}
        />
      ))}

      {/* Símbolos flotantes reducidos - solo 3 elementos */}
      {['✦', '❋', '✧'].map((symbol, index) => (
        <motion.div
          key={`symbol-${index}`}
          className="absolute text-sm opacity-15"
          style={{
            left: `${20 + index * 30}%`,
            top: `${25 + index * 20}%`,
            color: ['#9c27b0', '#e91e63', '#4caf50'][index]
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 25 + index * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 8
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  );
}