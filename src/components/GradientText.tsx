import { motion } from 'motion/react';
import { memo, ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export const GradientText = memo(({ children, className = '', animate = true }: GradientTextProps) => {
  if (!animate) {
    return (
      <span className={`bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={`bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: '200% auto',
      }}
      animate={{
        backgroundPosition: ['0% center', '200% center', '0% center'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
});

GradientText.displayName = 'GradientText';
