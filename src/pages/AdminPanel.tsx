import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { GradientText } from '../components/GradientText';
import { AdminWelcome } from '../components/AdminWelcome';
import { ServicesManager } from '../components/admin/ServicesManager';
import { ContactsManager } from '../components/admin/ContactsManager';
import { BrandingManager } from '../components/admin/BrandingManager';
import { HeroImagesManager } from '../components/admin/HeroImagesManager';
import { BenefitsManager } from '../components/admin/BenefitsManager';
import { DiscountManager } from '../components/admin/DiscountManager';
import { OrdersManager } from '../components/admin/OrdersManager';
import { ReviewsManager } from '../components/admin/ReviewsManager';
import { PricingManager } from '../components/admin/PricingManager';
import { GalleryManager } from '../components/admin/GalleryManager';
import { BlogManager } from '../components/admin/BlogManager';
import { AccountManager } from '../components/admin/AccountManager';
import { DataDiagnostic } from '../components/admin/DataDiagnostic';
import { DataExportImport } from '../components/admin/DataExportImport';
import { MediaGuide } from '../components/admin/MediaGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Lock, 
  Unlock, 
  DollarSign, 
  MessageSquare, 
  Image, 
  FileText, 
  Loader2,
  Phone,
  Percent,
  ShoppingCart,
  Download,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const AdminPanel = memo(() => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  
  // Use ref to ensure password is immediately available
  const passwordRef = useRef('');

  // Debug: log password changes
  useEffect(() => {
    console.log('Password state changed:', password ? '***' : 'EMPTY');
    passwordRef.current = password;
  }, [password]);
  
  // Handle logout on 401 errors globally
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('🚫 Unauthorized access detected - logging out');
      
      // Show clear message
      toast.error('Неправильний пароль! Ви будете переспрямовані на сторінку входу.', {
        duration: 5000,
      });
      
      // Delay logout slightly to allow user to see the message
      setTimeout(() => {
        setIsAuthenticated(false);
        setPassword('');
        passwordRef.current = '';
        sessionStorage.removeItem('adminPassword');
        setLoginError('⚠️ Неправильний пароль адміністратора');
      }, 1000);
    };

    // Listen for custom unauthorized events
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous error
    setLoginError(null);
    setLoading(true);
    
    try {
      // Trim password to remove spaces
      const cleanPassword = password.trim();
      console.log('🔐 Login attempt');
      console.log('🔐 Original password:', password ? `"${password}"` : 'EMPTY');
      console.log('🔐 Cleaned password:', cleanPassword ? `"${cleanPassword}"` : 'EMPTY');
      console.log('🔐 Length before:', password?.length, 'after:', cleanPassword?.length);
      
      if (!cleanPassword) {
        console.error('❌ Login failed: password is empty');
        setLoginError('Введіть пароль');
        return;
      }
      
      // Import validatePassword function
      const { validatePassword } = await import('../utils/api');
      
      // Validate password with server BEFORE logging in
      console.log('🔐 Validating password with server...');
      try {
        await validatePassword(cleanPassword);
        console.log('✅ Server validated password successfully');
      } catch (error) {
        console.error('❌ Server rejected password:', error);
        setLoginError('⚠️ Неправильний пароль адміністратора');
        return;
      }
      
      // Only proceed to login if password is valid
      setPassword(cleanPassword);
      passwordRef.current = cleanPassword;
      sessionStorage.setItem('adminPassword', cleanPassword);
      setIsAuthenticated(true);
      
      console.log('✅ Authentication successful, password stored:', `"${cleanPassword}"`);
      console.log('✅ Password ref set:', `"${passwordRef.current}"`);
      toast.success('Успішний вхід!');
    } catch (error) {
      console.error('❌ Login error:', error);
      setLoginError('Помилка входу. Спробуйте ще раз.');
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handlePasswordChanged = useCallback((newPassword: string) => {
    console.log('✅ Password changed successfully, updating session');
    setPassword(newPassword);
    passwordRef.current = newPassword;
    sessionStorage.setItem('adminPassword', newPassword);
    
    // Show info message about successful password change
    toast.success('Пароль успішно змінено! Використовуйте новий пароль для наступного входу.', {
      duration: 5000,
    });
  }, []);

  const handleResetPassword = useCallback(async () => {
    if (!confirm('⚠️ Це скине пароль до стандартного значення. Продовжити?')) {
      return;
    }
    
    setResetting(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      
      toast.success('Пароль успішно скинуто до стандартного значення');
      setLoginError(null);
      setPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Помилка скидання пароля');
    } finally {
      setResetting(false);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card/30 backdrop-blur-xl border-border">
            <CardHeader className="text-center">
              <div className={loginError ? 'animate-shake' : ''}>
                <Lock className={`w-12 h-12 mx-auto mb-4 ${loginError ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <CardTitle className="text-2xl">
                <GradientText>Адмін панель</GradientText>
              </CardTitle>
              <CardDescription>
                {loginError ? 'Спробуйте ще раз' : 'Введіть пароль для доступу'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg"
                >
                  <p className="text-sm text-destructive text-center font-medium">
                    {loginError}
                  </p>
                </motion.div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Введіть пароль адміністратора"
                    required
                    autoFocus
                    className={loginError ? 'border-destructive focus:border-destructive' : ''}
                  />
                </div>
                <Button type="submit" className="w-full neon-glow" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Перевірка...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Увійти
                    </>
                  )}
                </Button>
                
                {loginError && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleResetPassword}
                    disabled={resetting}
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Скидання...
                      </>
                    ) : (
                      '🔄 Скинути пароль до стандартного'
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Забули пароль?</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Використовуйте кнопку "Скинути пароль" вище або зверніться до адміністратора системи
              </p>
            </motion.div>
          )}
        </motion.div>
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
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            <GradientText>Адмін панель</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Керування контентом сайту
          </p>
        </motion.div>

        <AdminWelcome onTabChange={setActiveTab} password={password} />



        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-14 mb-8 h-auto gap-1">
            <TabsTrigger value="orders" className="text-xs lg:text-sm px-2">
              <ShoppingCart className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Замовлення</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="text-xs lg:text-sm px-2">
              <FileText className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Послуги</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs lg:text-sm px-2">
              <Phone className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Контакти</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs lg:text-sm px-2">
              <Image className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Бренд</span>
            </TabsTrigger>
            <TabsTrigger value="hero-images" className="text-xs lg:text-sm px-2">
              <Image className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="benefits" className="text-xs lg:text-sm px-2">
              <Shield className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Переваги</span>
            </TabsTrigger>
            <TabsTrigger value="discount" className="text-xs lg:text-sm px-2">
              <Percent className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Знижка</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs lg:text-sm px-2">
              <DollarSign className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Ціни</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs lg:text-sm px-2">
              <MessageSquare className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Відгуки</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs lg:text-sm px-2">
              <Image className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Галерея</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-xs lg:text-sm px-2">
              <FileText className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Блог</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs lg:text-sm px-2">
              <Shield className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Акаунт</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs lg:text-sm px-2">
              <Wifi className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Діагностика</span>
            </TabsTrigger>
            <TabsTrigger value="export-import" className="text-xs lg:text-sm px-2">
              <Download className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Експорт/Імпорт</span>
            </TabsTrigger>
            <TabsTrigger value="media-guide" className="text-xs lg:text-sm px-2">
              <HelpCircle className="w-4 h-4 mr-0 lg:mr-2" />
              <span className="hidden sm:inline">Довідка</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersManager password={password} />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManager password={password} />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsManager password={password} />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingManager password={password} />
          </TabsContent>

          <TabsContent value="hero-images">
            <HeroImagesManager password={password} />
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsManager password={password} />
          </TabsContent>

          <TabsContent value="discount">
            <DiscountManager password={password} />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingManager password={password} />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManager password={password} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager password={password} />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManager password={password} />
          </TabsContent>

          <TabsContent value="account">
            <AccountManager password={password} onPasswordChanged={handlePasswordChanged} />
          </TabsContent>

          <TabsContent value="diagnostics">
            <div className="space-y-6">
              <DataDiagnostic password={password} />
              <ConnectionTest />
            </div>
          </TabsContent>

          <TabsContent value="export-import">
            <DataExportImport password={password} />
          </TabsContent>

          <TabsContent value="media-guide">
            <MediaGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';
