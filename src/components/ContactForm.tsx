import { useState, memo, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Phone, Mail, MapPin, Clock, Zap, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { GradientText } from './GradientText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getServices, getContacts, createOrder } from '../utils/api';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
}

interface PhoneNumber {
  number: string;
  viber: boolean;
  telegram: boolean;
  whatsapp: boolean;
}

interface Contacts {
  phones: PhoneNumber[];
  email: string;
  address: string;
  schedule: string;
}

const ContactInfoCard = memo(({ 
  icon: Icon, 
  label, 
  value, 
  href, 
  color, 
  index, 
  prefersReducedMotion 
}: { 
  icon: any;
  label: string;
  value: string;
  href?: string;
  color: string;
  index: number;
  prefersReducedMotion: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08 }}
    whileHover={prefersReducedMotion ? {} : { x: 8 }}
    className="flex items-start gap-3 group cursor-pointer p-3 rounded-xl"
  >
    <div className={`${color} mt-0.5 flex-shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {href ? (
        <a
          href={href}
          className="text-foreground hover:text-primary transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-foreground">{value}</p>
      )}
    </div>
  </motion.div>
));

ContactInfoCard.displayName = 'ContactInfoCard';

export const ContactForm = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [services, setServices] = useState<Service[]>([]);
  const [contacts, setContacts] = useState<Contacts>({
    phones: [],
    email: 'info@bliskcleaning.ua',
    address: 'Київ, Україна',
    schedule: 'Пн-Нд: 24/7',
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    message: '',
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
      const [servicesRes, contactsRes, discountRes] = await Promise.all([
        getServices(),
        getContacts(),
        import('../utils/api').then(m => m.getDiscount())
      ]);
      setServices(servicesRes.data);
      if (contactsRes.data) {
        setContacts(contactsRes.data);
      }
      if (discountRes.data) {
        setDiscount(discountRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast.error('Введіть ваше ім\'я');
      return;
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      toast.error('Введіть номер телефону');
      return;
    }
    
    if (!formData.service) {
      toast.error('Оберіть послугу');
      return;
    }
    
    console.log('📝 Submitting order:', {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '(empty)',
      service: formData.service,
      message: formData.message || '(empty)'
    });
    
    try {
      const response = await createOrder({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        service: formData.service,
        message: formData.message.trim(),
      });

      if (response.success) {
        toast.success('✅ Замовлення успішно відправлено! Ми зв\'яжемося з вами найближчим часом.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          service: '',
          message: '',
        });
      } else {
        toast.error('Помилка відправки замовлення. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка';
      toast.error(`Помилка: ${errorMessage}`);
    }
  }, [formData]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Smart phone number formatting
  const handlePhoneChange = useCallback((value: string) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If user starts typing with 0 (Ukrainian format)
    if (cleaned.startsWith('0') && cleaned.length > 0) {
      cleaned = '+38' + cleaned;
    }
    // If user starts with 380 without +
    else if (cleaned.startsWith('380') && !cleaned.startsWith('+380')) {
      cleaned = '+' + cleaned;
    }
    // If user starts with 38 (but not 380)
    else if (cleaned.startsWith('38') && !cleaned.startsWith('380') && cleaned.length >= 3) {
      if (cleaned[2] === '0') {
        cleaned = '+' + cleaned;
      }
    }
    // If user types 80... convert to +380...
    else if (cleaned.startsWith('80') && cleaned.length > 2) {
      cleaned = '+3' + cleaned;
    }
    // If input is just digits and starts with reasonable mobile prefix
    else if (/^\d+$/.test(cleaned) && cleaned.length > 0) {
      const firstDigit = cleaned[0];
      // Ukrainian mobile operators start with: 39, 50, 63, 66, 67, 68, 73, 91, 92, 93, 94, 95, 96, 97, 98, 99
      if (cleaned.length >= 2) {
        const prefix = cleaned.substring(0, 2);
        const ukrainianPrefixes = ['39', '50', '63', '66', '67', '68', '73', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
        if (ukrainianPrefixes.includes(prefix)) {
          cleaned = '+380' + cleaned;
        }
      }
    }
    
    setFormData((prev) => ({ ...prev, phone: cleaned }));
  }, []);

  return (
    <section
      id="contact"
      className="py-16 md:py-24 bg-background relative overflow-hidden"
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
            <GradientText animate={!prefersReducedMotion}>Замовити</GradientText> послугу
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Заповніть форму і ми зв'яжемося з вами протягом 15 хвилин
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Форма замовлення
                </CardTitle>
                <CardDescription>
                  Вкажіть ваші дані та ми підберемо найкраще рішення
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name">Ім'я *</Label>
                      <Input
                        id="name"
                        placeholder="Ваше ім'я"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="098 123 45 67"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Введіть номер, +38 додасться автоматично
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="service">Послуга *</Label>
                    <Select
                      value={formData.service}
                      onValueChange={(value) => handleChange('service', value)}
                      required
                    >
                      <SelectTrigger
                        id="service"
                        className="border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm"
                      >
                        <SelectValue placeholder="Оберіть послугу" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.length > 0 ? (
                          services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="default" disabled>
                            Послуги не налаштовані
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="message">Повідомлення</Label>
                    <Textarea
                      id="message"
                      placeholder="Розкажіть про ваші побажання..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="border-primary/30 focus:border-primary bg-background/50 backdrop-blur-sm resize-none"
                    />
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full neon-glow group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Відправити заявку
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <Card className="bg-card/30 backdrop-blur-xl border-border shadow-xl">
              <CardHeader>
                <CardTitle>Контактна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contacts.phones.map((phone, index) => (
                  <div key={index} className="space-y-2">
                    <ContactInfoCard
                      icon={Phone}
                      label="Телефон"
                      value={phone.number}
                      href={`tel:${phone.number.replace(/\D/g, '')}`}
                      color="text-primary"
                      index={index * 4}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                    {(phone.viber || phone.telegram || phone.whatsapp) && (
                      <div className="flex gap-2 ml-8">
                        {phone.viber && (
                          <a
                            href={`viber://chat?number=${phone.number.replace(/\D/g, '')}`}
                            className="p-2 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors"
                            title="Viber"
                          >
                            <MessageCircle className="w-4 h-4 text-purple-500" />
                          </a>
                        )}
                        {phone.telegram && (
                          <a
                            href={`https://t.me/${phone.number.replace(/\D/g, '')}`}
                            className="p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                            title="Telegram"
                          >
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                          </a>
                        )}
                        {phone.whatsapp && (
                          <a
                            href={`https://wa.me/${phone.number.replace(/\D/g, '')}`}
                            className="p-2 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <ContactInfoCard
                  icon={Mail}
                  label="Email"
                  value={contacts.email}
                  href={`mailto:${contacts.email}`}
                  color="text-secondary"
                  index={contacts.phones.length * 4 + 1}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <ContactInfoCard
                  icon={MapPin}
                  label="Адреса"
                  value={contacts.address}
                  color="text-accent"
                  index={contacts.phones.length * 4 + 2}
                  prefersReducedMotion={prefersReducedMotion}
                />
                <ContactInfoCard
                  icon={Clock}
                  label="Графік роботи"
                  value={contacts.schedule}
                  color="text-primary"
                  index={contacts.phones.length * 4 + 3}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </CardContent>
            </Card>

            {discount.enabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              >
                <Card className="bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-primary/50 neon-glow backdrop-blur-xl">
                  <CardContent className="pt-6 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <p className="text-5xl mb-2">
                      <GradientText className="neon-text" animate={!prefersReducedMotion}>
                        -{discount.percentage}%
                      </GradientText>
                    </p>
                    <p className="text-foreground">{discount.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
});

ContactForm.displayName = 'ContactForm';
