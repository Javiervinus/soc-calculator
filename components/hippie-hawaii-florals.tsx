'use client';

import { motion } from 'framer-motion';
import { useBatteryStore } from '@/lib/store';

export function HippieHawaiiFlorals() {
  const { appTheme } = useBatteryStore();

  if (appTheme !== 'hippie') return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Hibiscos grandes - flores hawaianas icónicas */}
      {[...Array(4)].map((_, index) => (
        <motion.div
          key={`hibiscus-${index}`}
          className="absolute"
          style={{
            left: `${10 + index * 25}%`,
            top: `${15 + index * 20}%`,
            width: '80px',
            height: '80px',
          }}
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
            y: [0, -8, 0]
          }}
          transition={{
            duration: 12 + index * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 4
          }}
        >
          {/* Pétalos del hibisco */}
          {[...Array(5)].map((_, petalIndex) => (
            <motion.div
              key={`hibiscus-petal-${petalIndex}`}
              className="absolute"
              style={{
                width: '45px',
                height: '35px',
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${petalIndex * 72}deg)`,
                background: `linear-gradient(135deg, 
                  rgba(233, 30, 99, 0.6) 0%, 
                  rgba(156, 39, 176, 0.5) 50%, 
                  rgba(255, 111, 0, 0.4) 100%)`,
                borderRadius: '60% 40% 60% 40%',
                opacity: 0.7
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.9, 0.7]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: petalIndex * 0.5
              }}
            />
          ))}
          
          {/* Centro del hibisco con estambre */}
          <div
            className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(255, 193, 7, 0.8) 0%, rgba(255, 111, 0, 0.6) 70%)',
              opacity: 0.8
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-2 h-8 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'linear-gradient(to top, rgba(76, 175, 80, 0.8) 0%, transparent 100%)',
              borderRadius: '50%',
              opacity: 0.7
            }}
          />
        </motion.div>
      ))}

      {/* Plumerias (flores blancas/amarillas típicas de Hawaii) */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={`plumeria-${index}`}
          className="absolute"
          style={{
            right: `${5 + index * 15}%`,
            top: `${10 + index * 15}%`,
            width: '50px',
            height: '50px',
          }}
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.08, 1],
            x: [0, 5, -5, 0]
          }}
          transition={{
            duration: 15 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 3
          }}
        >
          {/* Pétalos de plumeria - 5 pétalos redondeados */}
          {[...Array(5)].map((_, petalIndex) => (
            <motion.div
              key={`plumeria-petal-${petalIndex}`}
              className="absolute"
              style={{
                width: '25px',
                height: '20px',
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${petalIndex * 72}deg)`,
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.8) 0%, 
                  rgba(255, 235, 59, 0.6) 50%, 
                  rgba(255, 193, 7, 0.5) 100%)`,
                borderRadius: '50% 50% 30% 30%',
                opacity: 0.8
              }}
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: petalIndex * 0.3
              }}
            />
          ))}
          
          {/* Centro amarillo de plumeria */}
          <div
            className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(255, 235, 59, 0.9) 0%, rgba(255, 193, 7, 0.7) 100%)',
              opacity: 0.9
            }}
          />
        </motion.div>
      ))}

      {/* Hojas de palma tropicales */}
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={`palm-leaf-${index}`}
          className="absolute"
          style={{
            left: `${20 + index * 20}%`,
            bottom: `${10 + index * 10}%`,
            width: '120px',
            height: '40px',
          }}
          animate={{
            rotate: [0, 8, -8, 0],
            x: [0, 10, -10, 0],
            y: [0, -5, 0]
          }}
          transition={{
            duration: 18 + index * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 2
          }}
        >
          {/* Hoja de palma con forma característica */}
          <div
            className="w-full h-full relative"
            style={{
              background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(76, 175, 80, 0.4) 20%, 
                rgba(139, 195, 74, 0.5) 50%, 
                rgba(76, 175, 80, 0.4) 80%, 
                transparent 100%)`,
              borderRadius: '0% 100% 100% 0%',
              opacity: 0.6,
              transform: `rotate(${index * 15 - 30}deg)`
            }}
          />
          
          {/* Nervaduras de la hoja */}
          {[...Array(7)].map((_, veinIndex) => (
            <div
              key={`vein-${veinIndex}`}
              className="absolute"
              style={{
                left: `${veinIndex * 15 + 10}%`,
                top: '50%',
                width: '1px',
                height: '60%',
                background: 'rgba(76, 175, 80, 0.3)',
                transform: `translateY(-50%) rotate(${veinIndex * 5 - 15}deg)`,
                transformOrigin: 'bottom',
                opacity: 0.4
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Hojas de monstera (hojas tropicales con agujeros) */}
      {[...Array(3)].map((_, index) => (
        <motion.div
          key={`monstera-${index}`}
          className="absolute"
          style={{
            right: `${15 + index * 25}%`,
            bottom: `${20 + index * 15}%`,
            width: '90px',
            height: '100px',
          }}
          animate={{
            rotate: [0, -5, 5, 0],
            scale: [1, 1.03, 1],
            x: [0, -8, 8, 0]
          }}
          transition={{
            duration: 20 + index * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 6
          }}
        >
          {/* Hoja de monstera con forma característica */}
          <div
            className="w-full h-full relative"
            style={{
              background: `radial-gradient(ellipse 80% 90% at 30% 40%, 
                rgba(76, 175, 80, 0.5) 0%, 
                rgba(139, 195, 74, 0.4) 40%, 
                rgba(76, 175, 80, 0.3) 100%)`,
              borderRadius: '50% 30% 70% 40%',
              opacity: 0.6,
              clipPath: 'polygon(10% 20%, 30% 5%, 60% 15%, 80% 5%, 90% 30%, 85% 60%, 70% 80%, 50% 85%, 30% 75%, 15% 50%)'
            }}
          />
          
          {/* "Agujeros" característicos de la monstera */}
          <div
            className="absolute"
            style={{
              top: '25%',
              left: '30%',
              width: '12px',
              height: '8px',
              background: 'transparent',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '50%',
              opacity: 0.5
            }}
          />
          <div
            className="absolute"
            style={{
              top: '45%',
              left: '60%',
              width: '8px',
              height: '12px',
              background: 'transparent',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              borderRadius: '50%',
              opacity: 0.5
            }}
          />
        </motion.div>
      ))}

      {/* Brisa tropical sutil - movimiento de aire */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 600px 200px at 25% 75%, rgba(139, 195, 74, 0.02) 0%, transparent 60%),
            radial-gradient(ellipse 400px 300px at 75% 25%, rgba(76, 175, 80, 0.015) 0%, transparent 60%)
          `,
          opacity: 0.3
        }}
        animate={{
          scale: [1, 1.02, 1],
          opacity: [0.03, 0.06, 0.03],
          x: [0, 5, -5, 0]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Pétalos flotantes cayendo suavemente */}
      {[...Array(8)].map((_, index) => (
        <motion.div
          key={`floating-petal-${index}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: '8px',
            height: '12px',
            background: `linear-gradient(135deg, 
              rgba(233, 30, 99, 0.6) 0%, 
              rgba(156, 39, 176, 0.4) 100%)`,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            opacity: 0.5
          }}
          animate={{
            y: [0, window.innerHeight + 50],
            x: [0, 20, -20, 20, 0],
            rotate: [0, 180, 360],
            scale: [1, 0.8, 1.2, 0.6]
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeOut",
            delay: index * 2
          }}
        />
      ))}
    </div>
  );
}