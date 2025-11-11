import { Home, Building2, Sparkles, Square, Sofa, Droplet, Loader2, Briefcase, Scissors, Wind, Zap, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion } from 'motion/react';
import { memo, useEffect, useState } from 'react';
import { GradientText } from './GradientText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getServices } from '../utils/api';

// Icon mapping for services
const iconMap: { [key: string]: any } = {
  Home,
  Building2,
  Sparkles,
  Square,
  Sofa,
  Droplet,
  Briefcase,
  Scissors,
  Wind,
  Zap,
  Shield,
  Globe,
};

const gradients = [
  { gradient: 'from-primary/20 to-primary/5', iconColor: 'text-primary', icon: 'Home' },
  { gradient: 'from-secondary/20 to-secondary/5', iconColor: 'text-secondary', icon: 'Building2' },
  { gradient: 'from-accent/20 to-accent/5', iconColor: 'text-accent', icon: 'Sparkles' },
  { gradient: 'from-primary/20 to-cyan-500/5', iconColor: 'text-primary', icon: 'Square' },
  { gradient: 'from-secondary/20 to-purple-500/5', iconColor: 'text-secondary', icon: 'Sofa' },
  { gradient: 'from-accent/20 to-pink-500/5', iconColor: 'text-accent', icon: 'Droplet' },
  { gradient: 'from-primary/20 to-blue-500/5', iconColor: 'text-primary', icon: 'Briefcase' },
  { gradient: 'from-secondary/20 to-indigo-500/5', iconColor: 'text-secondary', icon: 'Scissors' },
  { gradient: 'from-accent/20 to-teal-500/5', iconColor: 'text-accent', icon: 'Wind' },
  { gradient: 'from-primary/20 to-yellow-500/5', iconColor: 'text-primary', icon: 'Zap' },
  { gradient: 'from-secondary/20 to-green-500/5', iconColor: 'text-secondary', icon: 'Shield' },
  { gradient: 'from-accent/20 to-orange-500/5', iconColor: 'text-accent', icon: 'Globe' },
];

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

const ServiceCard = memo(
  ({
    service,
    index,
    prefersReducedMotion,
    style,
  }: {
    service: Service & { gradient?: string; iconColor?: string; icon?: string };
    index: number;
    prefersReducedMotion: boolean;
    style: { gradient: string; iconColor: string; icon: string };
  }) => {
    const Icon = iconMap[style.icon] || Home;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.08, duration: 0.5 }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -8 }}
      >
        <Card className="h-full bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group overflow-hidden relative">
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

          <CardHeader className="relative z-10">
            <div
              className={`w-14 h-14 bg-gradient-to-br ${style.gradient} rounded-xl flex items-center justify-center mb-4 border border-primary/20 group-hover:border-primary/50 transition-all shadow-lg`}
            >
              <Icon className={`w-7 h-7 ${style.iconColor}`} />
            </div>
            <CardTitle className="group-hover:text-primary transition-colors duration-300">
              {service.title}
            </CardTitle>
            <CardDescription className="group-hover:text-foreground/80 transition-colors">
              {service.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ul className="space-y-2">
              {service.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  <div className={`w-1.5 h-1.5 ${style.iconColor.replace('text-', 'bg-')} rounded-full`} />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

ServiceCard.displayName = 'ServiceCard';

export const Services = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="services"
      className="py-16 md:py-24 bg-muted/30 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-foreground mb-4 text-4xl md:text-5xl">
            <GradientText animate={!prefersReducedMotion}>Наші</GradientText> послуги
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Ми пропонуємо широкий спектр клінінгових послуг для дому та бізнесу
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
                style={gradients[index % gradients.length]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Послуги ще не налаштовані. Перейдіть в адмін панель щоб додати послуги.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

Services.displayName = 'Services';
