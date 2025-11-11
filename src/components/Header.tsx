import { Sparkles, Phone, Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { motion } from 'motion/react';
import { getBranding, getContacts } from '../utils/api';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [branding, setBranding] = useState({ logo: '', companyName: 'БлискКлінінг' });
  const [phoneNumber, setPhoneNumber] = useState('+380 (12) 345-67-89');

  useEffect(() => {
    loadData();

    // Listen for updates from admin panel
    const handleContactsUpdate = () => loadData();
    const handleBrandingUpdate = () => loadData();

    window.addEventListener('contactsUpdated', handleContactsUpdate);
    window.addEventListener('brandingUpdated', handleBrandingUpdate);

    return () => {
      window.removeEventListener('contactsUpdated', handleContactsUpdate);
      window.removeEventListener('brandingUpdated', handleBrandingUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [brandingRes, contactsRes] = await Promise.all([
        getBranding(),
        getContacts()
      ]);
      
      if (brandingRes.data) {
        setBranding(brandingRes.data);
      }
      
      if (contactsRes.data?.phones?.length > 0) {
        setPhoneNumber(contactsRes.data.phones[0].number);
      }
    } catch (error) {
      console.error('Error loading header data:', error);
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // 🔐 Доступ до адмін панелі: використайте URL параметр ?page=admin
  // Або відкрийте консоль браузера (F12) та введіть: window.location.hash = '#admin'
  
  const menuItems = [
    { id: 'home', label: 'Головна', type: 'page' },
    { id: 'pricing', label: 'Ціни', type: 'page' },
    { id: 'reviews', label: 'Відгуки', type: 'both' },
    { id: 'gallery', label: 'Галерея', type: 'page' },
    { id: 'blog', label: 'Блог', type: 'page' },
    { id: 'contact', label: 'Контакти', type: 'section' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-b border-border z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => handleNavigate('home')}
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
            <span className="text-2xl text-foreground">{branding.companyName}</span>
          </motion.button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                onClick={() => {
                  if (item.type === 'section') {
                    scrollToSection(item.id);
                  } else if (item.type === 'both') {
                    handleNavigate(item.id);
                  } else {
                    handleNavigate(item.id);
                  }
                }}
                className={`text-muted-foreground hover:text-primary transition-colors relative group ${
                  currentPage === item.id ? 'text-primary' : ''
                }`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  currentPage === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </motion.button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </motion.button>
            
            <a href={`tel:${phoneNumber.replace(/\\D/g, '')}`} className="flex items-center gap-2 text-primary">
              <Phone className="w-5 h-5" />
              <span>{phoneNumber}</span>
            </a>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => scrollToSection('contact')} className="neon-glow">
                Замовити
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-muted"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </motion.button>
            
            <button 
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'section') {
                      scrollToSection(item.id);
                    } else {
                      handleNavigate(item.id);
                    }
                  }}
                  className={`text-left ${
                    currentPage === item.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  } transition-colors`}
                >
                  {item.label}
                </button>
              ))}
              <a href={`tel:${phoneNumber.replace(/\\D/g, '')}`} className="flex items-center gap-2 text-primary">
                <Phone className="w-5 h-5" />
                <span>{phoneNumber}</span>
              </a>
              <Button onClick={() => scrollToSection('contact')} className="w-full">
                Замовити
              </Button>
            </div>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
