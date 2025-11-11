import { motion } from 'motion/react';
import { memo, useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Particle = memo(({ index, randomX, randomY, randomDelay, randomDuration, randomSize, color }: { 
  index: number;
  randomX: number;
  randomY: number;
  randomDelay: number;
  randomDuration: number;
  randomSize: number;
  color: string;
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="absolute rounded-full will-change-transform"
      style={{
        left: `${randomX}%`,
        top: `${randomY}%`,
        width: randomSize,
        height: randomSize,
        background: color,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'linear',
      }}
    />
  );
});

Particle.displayName = 'Particle';

export const ParticlesBackground = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  
  // Generate particle data once
  const particles = useMemo(() => {
    const count = 12; // Reduced from 30 to 12
    const colors = ['var(--neon-cyan)', 'var(--neon-purple)', 'var(--neon-pink)'];
    
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      randomX: Math.random() * 100,
      randomY: Math.random() * 100,
      randomDelay: Math.random() * 3,
      randomDuration: 15 + Math.random() * 10, // Slower animations
      randomSize: 2 + Math.random() * 3,
      color: colors[i % 3],
    }));
  }, []);

  if (prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
      {particles.map((particle) => (
        <Particle key={particle.index} {...particle} />
      ))}
    </div>
  );
});

ParticlesBackground.displayName = 'ParticlesBackground';
