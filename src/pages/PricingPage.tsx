import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GradientText } from '../components/GradientText';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { getPricing } from '../utils/api';
import { Loader2, Home, Droplets, Wind, Plus } from 'lucide-react';

interface PricingData {
  cleaning?: Array<{
    area: string;
    afterRepair: string;
    general: string;
    supporting: string;
  }>;
  windows?: Array<{
    type: string;
    price: string;
  }>;
  chemistry?: Array<{
    item: string;
    price: string;
  }>;
  additional?: Array<{
    service: string;
    price: string;
  }>;
}

export const PricingPage = memo(() => {
  const [pricing, setPricing] = useState<PricingData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const response = await getPricing();
      const pricingMap: PricingData = {};
      
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item: any) => {
          // Check if item and item.key exist before trying to replace
          if (item && item.key && typeof item.key === 'string') {
            const key = item.key.replace('price:', '');
            pricingMap[key as keyof PricingData] = item.value;
          }
        });
      }
      
      setPricing(pricingMap);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            <GradientText>Ціни</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Вартість наших послуг
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Cleaning Prices */}
          {pricing.cleaning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">Вартість прибирання</CardTitle>
                  </div>
                  <CardDescription>
                    Професійне прибирання квартир та будинків
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Desktop view */}
                  <div className="hidden lg:block overflow-x-auto">
                    <div className="min-w-full">
                      {/* Header */}
                      <div className="grid grid-cols-4 gap-4 mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <Home className="w-4 h-4" />
                          <span>Площа</span>
                        </div>
                        <div className="text-sm font-semibold text-center text-muted-foreground">
                          Після ремонту
                        </div>
                        <div className="text-sm font-semibold text-center text-muted-foreground">
                          Генеральне
                        </div>
                        <div className="text-sm font-semibold text-center text-muted-foreground">
                          Підтримуюче
                        </div>
                      </div>
                      
                      {/* Rows */}
                      <div className="space-y-2">
                        {pricing.cleaning.map((row, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="grid grid-cols-4 gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center font-medium">
                              {row.area}
                            </div>
                            <div className="text-center text-foreground">
                              {row.afterRepair}
                            </div>
                            <div className="text-center text-foreground">
                              {row.general}
                            </div>
                            <div className="text-center text-foreground">
                              {row.supporting}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile/Tablet view */}
                  <div className="lg:hidden space-y-4">
                    {pricing.cleaning.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="p-4 rounded-lg bg-muted/30 border border-border space-y-3"
                      >
                        {/* Area header */}
                        <div className="flex items-center gap-2 pb-3 border-b border-border">
                          <Home className="w-4 h-4 text-primary" />
                          <span className="font-medium">{row.area}</span>
                        </div>
                        
                        {/* Price rows */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Після ремонту</span>
                            <span className="font-medium">{row.afterRepair}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Генеральне</span>
                            <span className="font-medium">{row.general}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Підтримуюче</span>
                            <span className="font-medium">{row.supporting}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Window Cleaning Prices */}
          {pricing.windows && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl flex items-center justify-center border border-secondary/20">
                      <Droplets className="w-6 h-6 text-secondary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">Вартість миття вікон</CardTitle>
                  </div>
                  <CardDescription>
                    Професійне миття вікон з обох сторін
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pricing.windows.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-medium">{row.type}</span>
                        <span className="text-foreground">{row.price}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chemistry Prices */}
          {pricing.chemistry && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center border border-accent/20">
                      <Wind className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">Вартість хімчистки</CardTitle>
                  </div>
                  <CardDescription>
                    Професійна хімчистка меблів та килимів
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pricing.chemistry.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.03 }}
                        className="p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                      >
                        <p className="text-sm text-muted-foreground mb-2">{row.item}</p>
                        <p className="font-semibold text-foreground">{row.price}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm text-muted-foreground">
                      Мінімальна ціна виїзду на хімчистку – 1500 грн.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Additional Services */}
          {pricing.additional && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-cyan-500/5 rounded-xl flex items-center justify-center border border-primary/20">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">Додаткові послуги</CardTitle>
                  </div>
                  <CardDescription>
                    Розширте пакет прибирання додатковими опціями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pricing.additional.map((row, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-medium">{row.service}</span>
                        <span className="text-foreground">{row.price}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});

PricingPage.displayName = 'PricingPage';
