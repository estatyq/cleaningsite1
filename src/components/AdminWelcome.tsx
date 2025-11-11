import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Info, DollarSign, MessageSquare, Image, FileText, Zap, Phone, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface AdminWelcomeProps {
  onTabChange?: (tab: string) => void;
  password?: string;
}

export const AdminWelcome = memo(({ onTabChange, password }: AdminWelcomeProps) => {
  const [initializing, setInitializing] = useState(false);

  const handleQuickSetup = async () => {
    if (!password) {
      toast.error('Помилка: пароль не знайдено');
      return;
    }

    console.log('Quick setup started with password:', password);
    setInitializing(true);
    try {
      // Import functions
      const { 
        initializeServices, 
        initializeContacts, 
        initializeBranding,
        initializeSocialMedia,
        initializeHeroImages,
        initializeDiscount,
        initializePricing 
      } = await import('../utils/initializeData');
      const { addGalleryItem } = await import('../utils/api');
      const { sampleGalleryItems } = await import('../utils/sampleData');

      // Initialize all data
      console.log('Initializing services...');
      await initializeServices(password);
      console.log('Services initialized');
      
      console.log('Initializing contacts...');
      await initializeContacts(password);
      console.log('Contacts initialized');
      
      console.log('Initializing branding...');
      await initializeBranding(password);
      console.log('Branding initialized');
      
      console.log('Initializing social media...');
      await initializeSocialMedia(password);
      console.log('Social media initialized');
      
      console.log('Initializing hero images...');
      await initializeHeroImages(password);
      console.log('Hero images initialized');
      
      console.log('Initializing discount...');
      await initializeDiscount(password);
      console.log('Discount initialized');
      
      console.log('Initializing pricing...');
      await initializePricing(password);
      console.log('Pricing initialized');
      
      // Add sample gallery items
      console.log('Adding gallery items...');
      for (const item of sampleGalleryItems) {
        await addGalleryItem(password, item);
      }
      console.log('Gallery items added');

      toast.success('🎉 Всі дані успішно завантажено!');
    } catch (error) {
      console.error('Error in quick setup:', error);
      toast.error(`Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
    } finally {
      setInitializing(false);
    }
  };
  const steps = [
    {
      icon: FileText,
      title: 'Налаштуйте послуги',
      description: 'Додайте послуги які ви пропонуєте клієнтам',
      color: 'text-primary',
      tab: 'services',
    },
    {
      icon: Phone,
      title: 'Заповніть контакти',
      description: 'Вкажіть телефони, email та графік роботи',
      color: 'text-secondary',
      tab: 'contacts',
    },
    {
      icon: Sparkles,
      title: 'Налаштуйте брендинг',
      description: 'Логотип, назва компанії та соцмережі',
      color: 'text-accent',
      tab: 'branding',
    },
    {
      icon: Image,
      title: 'Головні зображення',
      description: 'Фото для героїчної секції',
      color: 'text-primary',
      tab: 'hero-images',
    },
    {
      icon: DollarSign,
      title: 'Налаштуйте знижку',
      description: 'Відсоток знижки на перше замовлення',
      color: 'text-accent',
      tab: 'discount',
    },
    {
      icon: DollarSign,
      title: 'Налаштуйте ціни',
      description: 'Завантажте початкові дані або додайте власні ціни',
      color: 'text-secondary',
      tab: 'pricing',
    },
    {
      icon: MessageSquare,
      title: 'Модеруйте відгуки',
      description: 'Затверджуйте відгуки клієнтів щоденно',
      color: 'text-accent',
      tab: 'reviews',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/30 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Ласкаво просимо в адмін панель!</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Керуйте контентом вашого сайту легко та швидко
                </p>
              </div>
            </div>
            {password && (
              <Button
                onClick={handleQuickSetup}
                disabled={initializing}
                className="neon-glow"
                size="lg"
              >
                {initializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Завантаження...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Швидке заповнення
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange?.(step.tab)}
                className="flex items-start gap-3 p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 hover:bg-card/70 transition-all cursor-pointer text-left"
              >
                <div className={`${step.color} mt-1`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium mb-1">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Швидкий старт:</strong>
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Додайте послуги у вкладці "Послуги"</li>
                <li>Заповніть контактну інформацію у вкладці "Контакти"</li>
                <li>Завантажте початкові ціни у вкладці "Ціни"</li>
                <li>Додайте фото робіт в "Галерею"</li>
                <li>Створіть перший пост в "Блозі"</li>
              </ol>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={() => onTabChange?.('password')}
                >
                  🔐 Змініть пароль для безпеки
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  📚 Детальна інструкція в GUIDE_UA.md
                </Badge>
                {password && (
                  <Badge variant="default" className="text-xs bg-primary/20">
                    ⚡ Натисніть "Швидке заповнення" для автозаповнення
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AdminWelcome.displayName = 'AdminWelcome';
