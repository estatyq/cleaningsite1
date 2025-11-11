import { Shield, Clock, Award, ThumbsUp, Users, Leaf } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { GradientText } from './GradientText';
import { memo, useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const benefits = [
  {
    icon: Shield,
    title: 'Гарантія якості',
    description: 'Повернемо кошти, якщо ви не задоволені результатом',
    color: 'text-primary',
  },
  {
    icon: Clock,
    title: 'Пунктуальність',
    description: 'Завжди приїжджаємо вчасно та дотримуємось графіку',
    color: 'text-secondary',
  },
  {
    icon: Award,
    title: 'Професіоналізм',
    description: 'Наші співробітники пройшли спеціальне навчання',
    color: 'text-accent',
  },
  {
    icon: ThumbsUp,
    title: 'Досвід',
    description: 'Понад 5 років успішної роботи на ринку',
    color: 'text-primary',
  },
  {
    icon: Users,
    title: 'Індивідуальний підхід',
    description: 'Врахуємо всі ваші побажання та особливості',
    color: 'text-secondary',
  },
  {
    icon: Leaf,
    title: 'Екологічність',
    description: 'Використовуємо безпечні та екологічні засоби',
    color: 'text-accent',
  },
];

const BenefitCard = memo(
  ({
    benefit,
    index,
    prefersReducedMotion,
  }: {
    benefit: (typeof benefits)[0];
    index: number;
    prefersReducedMotion: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.03, x: 8 }}
      className="space-y-3 group cursor-pointer"
    >
      <div
        className={`w-14 h-14 bg-card/50 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center group-hover:border-primary transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20`}
      >
        <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
      </div>

      <h3 className="text-foreground group-hover:text-primary transition-colors duration-300">
        {benefit.title}
      </h3>
      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {benefit.description}
      </p>
    </motion.div>
  )
);

BenefitCard.displayName = 'BenefitCard';

export const Benefits = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [benefitsImage, setBenefitsImage] = useState('https://images.unsplash.com/photo-1758523670634-df4e12ed7a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGhvbWV8ZW58MXx8fHwxNzYyNjgwODIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');

  useEffect(() => {
    loadBenefitsImage();
  }, []);

  const loadBenefitsImage = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/benefits`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.image) {
          setBenefitsImage(data.data.image);
        }
      }
    } catch (error) {
      console.error('Error loading benefits image:', error);
    }
  };

  return (
    <section
      id="benefits"
      className="py-16 md:py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-foreground mb-6 text-4xl md:text-5xl">
              Чому <GradientText animate={!prefersReducedMotion}>обирають</GradientText> нас
            </h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg text-muted-foreground mb-8"
            >
              Ми прагнемо забезпечити найвищу якість послуг та комфорт для наших
              клієнтів
            </motion.p>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  benefit={benefit}
                  index={index}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {benefitsImage && benefitsImage.trim() !== '' && (
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden border-2 border-secondary/30 neon-glow-purple shadow-2xl"
              >
                <ImageWithFallback
                  src={benefitsImage}
                  alt="Чистий дім"
                  className="w-full h-auto"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

Benefits.displayName = 'Benefits';
