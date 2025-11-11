import { Sparkles, Facebook, Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getContacts, getServices, getSocialMedia, getBranding } from '../utils/api';

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

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
}

interface SocialMedia {
  facebook: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
}

interface Branding {
  logo: string;
  companyName: string;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [contacts, setContacts] = useState<Contacts>({
    phones: [{ number: '+380 (12) 345-67-89', viber: false, telegram: false, whatsapp: false }],
    email: 'info@bliskcleaning.ua',
    address: 'Київ, Україна',
    schedule: 'Пн-Нд: 24/7',
  });
  const [services, setServices] = useState<Service[]>([]);
  const [social, setSocial] = useState<SocialMedia>({
    facebook: { url: '', enabled: false },
    instagram: { url: '', enabled: false }
  });
  const [branding, setBranding] = useState<Branding>({
    logo: '',
    companyName: 'БлискКлінінг'
  });

  useEffect(() => {
    loadData();

    // Listen for updates from admin panel
    const handleContactsUpdate = () => loadData();
    const handleBrandingUpdate = () => loadData();
    const handleSocialMediaUpdate = () => loadData();

    window.addEventListener('contactsUpdated', handleContactsUpdate);
    window.addEventListener('brandingUpdated', handleBrandingUpdate);
    window.addEventListener('socialMediaUpdated', handleSocialMediaUpdate);

    return () => {
      window.removeEventListener('contactsUpdated', handleContactsUpdate);
      window.removeEventListener('brandingUpdated', handleBrandingUpdate);
      window.removeEventListener('socialMediaUpdated', handleSocialMediaUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, servicesRes, socialRes, brandingRes] = await Promise.all([
        getContacts(),
        getServices(),
        getSocialMedia(),
        getBranding()
      ]);

      if (contactsRes.data && Object.keys(contactsRes.data).length > 0) {
        setContacts(contactsRes.data);
      }
      if (servicesRes.data && servicesRes.data.length > 0) {
        setServices(servicesRes.data.slice(0, 4));
      }
      if (socialRes.data) {
        setSocial(socialRes.data);
      }
      if (brandingRes.data) {
        setBranding(brandingRes.data);
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };



  const footerLinks = [
    {
      title: 'Послуги',
      links: services.length > 0 
        ? services.map(service => ({ 
            label: service.title, 
            href: '#services' 
          }))
        : [
            { label: 'Прибирання квартир', href: '#services' },
            { label: 'Прибирання офісів', href: '#services' },
            { label: 'Генеральне прибирання', href: '#services' },
            { label: 'Миття вікон', href: '#services' },
          ],
    },
    {
      title: 'Компанія',
      links: [
        { label: 'Про нас', href: '#benefits' },
        { label: 'Відгуки', href: '#reviews' },
        { label: 'Контакти', href: '#contact' },
        { label: 'Вакансії', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t border-border py-12 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              {branding.logo ? (
                <img 
                  src={branding.logo} 
                  alt={branding.companyName}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const sparkles = document.createElement('div');
                    sparkles.innerHTML = '<svg class="w-8 h-8 text-primary neon-text" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813 6.088.281-4.777 3.652 1.684 6.003L12 15.497l-4.907 3.252 1.684-6.003L4 9.094l6.088-.281L12 3z"/></svg>';
                    (e.target as HTMLImageElement).parentNode?.insertBefore(sparkles.firstChild!, e.target);
                  }}
                />
              ) : (
                <Sparkles className="w-8 h-8 text-primary neon-text" />
              )}
              <span className="text-xl text-foreground">{branding.companyName}</span>
            </motion.div>
            <p className="text-muted-foreground text-sm">
              Професійні послуги прибирання для вашого комфорту та чистоти
            </p>
          </motion.div>

          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <h3 className="text-lg mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-2 text-muted-foreground text-sm">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a href={link.href} className="hover:text-primary transition-colors">
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h3 className="text-lg mb-4 text-foreground">Контакти</h3>
            <ul className="space-y-3 text-muted-foreground text-sm">
              {contacts.phones.map((phone, index) => (
                <li key={index} className="space-y-1">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${phone.number.replace(/\D/g, '')}`} className="hover:text-primary transition-colors">
                      {phone.number}
                    </a>
                  </motion.div>
                  {(phone.viber || phone.telegram || phone.whatsapp) && (
                    <div className="flex gap-2 ml-6">
                      {phone.viber && (
                        <motion.a
                          href={`viber://chat?number=${phone.number.replace(/\D/g, '')}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-colors"
                          title="Viber"
                        >
                          <MessageCircle className="w-3 h-3 text-purple-500" />
                        </motion.a>
                      )}
                      {phone.telegram && (
                        <motion.a
                          href={`https://t.me/${phone.number.replace(/\D/g, '')}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                          title="Telegram"
                        >
                          <MessageCircle className="w-3 h-3 text-blue-500" />
                        </motion.a>
                      )}
                      {phone.whatsapp && (
                        <motion.a
                          href={`https://wa.me/${phone.number.replace(/\D/g, '')}`}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center hover:bg-green-500/20 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-green-500" />
                        </motion.a>
                      )}
                    </div>
                  )}
                </li>
              ))}
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-secondary" />
                <a href={`mailto:${contacts.email}`} className="hover:text-primary transition-colors">
                  {contacts.email}
                </a>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {contacts.address}
                </a>
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{contacts.schedule}</span>
              </motion.li>
            </ul>
            {(social.facebook.enabled || social.instagram.enabled) && (
              <div className="flex gap-4 mt-4">
                {social.facebook.enabled && (
                  <motion.a
                    href={social.facebook.url || "#"}
                    target={social.facebook.url ? "_blank" : undefined}
                    rel={social.facebook.url ? "noopener noreferrer" : undefined}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 bg-muted border border-primary/30 rounded-full flex items-center justify-center hover:bg-primary/20 hover:border-primary transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-primary" />
                  </motion.a>
                )}
                {social.instagram.enabled && (
                  <motion.a
                    href={social.instagram.url || "#"}
                    target={social.instagram.url ? "_blank" : undefined}
                    rel={social.instagram.url ? "noopener noreferrer" : undefined}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-8 h-8 bg-muted border border-accent/30 rounded-full flex items-center justify-center hover:bg-accent/20 hover:border-accent transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-accent" />
                  </motion.a>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="border-t border-border pt-8 text-center text-muted-foreground text-sm"
        >
          <p>&copy; {currentYear} {branding.companyName}. Всі права захищені.</p>
        </motion.div>
      </div>
    </footer>
  );
}
