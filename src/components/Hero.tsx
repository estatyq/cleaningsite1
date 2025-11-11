import { Button } from './ui/button';
import { CheckCircle, Zap, ArrowRight, Tag } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { GradientText } from './GradientText';
import { memo, useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getHeroImages, getDiscount } from '../utils/api';

const StatBadge = memo(({ delay, value, label, gradient }: { delay: number; value: string; label: string; gradient: string }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, type: 'spring' }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
      className={`absolute backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl ${gradient} will-change-transform`}
    >
      <p className="text-4xl mb-1">{value}</p>
      <p className="text-sm text-white/90">{label}</p>
    </motion.div>
  );
});

StatBadge.displayName = 'StatBadge';

export const Hero = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [heroImages, setHeroImages] = useState({
    mainImage: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
  });
  const [discount, setDiscount] = useState({
    enabled: true,
    percentage: 20,
    description: 'Знижка на перше замовлення'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [imagesRes, discountRes] = await Promise.all([
        getHeroImages(),
        getDiscount()
      ]);
      
      if (imagesRes.data) {
        setHeroImages(imagesRes.data);
      }
      if (discountRes.data) {
        setDiscount(discountRes.data);
      }
    } catch (error) {
      console.error('Error loading hero data:', error);
    }
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    'Досвідчені фахівці з сертифікатами',
    'Екологічно чисті засоби',
    'Гарантія якості 100%',
  ];

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Simplified animated background blobs */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-20 right-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl will-change-transform"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-20 left-10 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-3xl will-change-transform"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full backdrop-blur-sm"
                >
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">Найкращий клінінг в місті</span>
                </motion.div>
                {discount.enabled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full backdrop-blur-sm"
                  >
                    <Tag className="w-4 h-4 text-accent" />
                    <span className="text-sm text-accent">
                      {discount.description}: <strong>{discount.percentage}%</strong>
                    </span>
                  </motion.div>
                )}
              </div>

              <h1 className="text-foreground leading-tight">
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="block text-5xl md:text-6xl lg:text-7xl"
                >
                  Професійний
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="block text-5xl md:text-6xl lg:text-7xl my-2"
                >
                  <GradientText className="neon-text" animate={!prefersReducedMotion}>клінінг</GradientText>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="block text-5xl md:text-6xl lg:text-7xl"
                >
                  для вашого дому
                </motion.span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-xl text-muted-foreground"
            >
              Довірте прибирання професіоналам і насолоджуйтесь ідеальною чистотою
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="space-y-3"
            >
              {features.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={prefersReducedMotion ? {} : { x: 10 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {item}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={scrollToContact}
                  className="neon-glow group"
                >
                  <span className="flex items-center gap-2">
                    Замовити прибирання
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-primary/30 hover:bg-primary/10 backdrop-blur-sm"
                >
                  Переглянути послуги
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative space-y-4"
          >
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden border-2 border-primary/30 neon-glow"
            >
              <ImageWithFallback
                src={heroImages.mainImage}
                alt="Професійне прибирання"
                className="w-full h-auto"
              />
            </motion.div>

            {/* Додаткове зображення */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              className="relative rounded-2xl overflow-hidden border-2 border-secondary/30 hover:border-secondary/50 transition-all duration-300 neon-glow"
            >
              <ImageWithFallback
                src={heroImages.secondaryImage}
                alt="Результати прибирання"
                className="w-full h-auto"
              />
            </motion.div>

            <StatBadge
              delay={1.5}
              value="5+"
              label="років досвіду"
              gradient="bg-gradient-to-br from-primary/90 to-secondary/90 -bottom-6 -left-6"
            />

            <StatBadge
              delay={1.7}
              value="2000+"
              label="задоволених клієнтів"
              gradient="bg-gradient-to-br from-accent/90 to-secondary/90 -top-6 -right-6"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
