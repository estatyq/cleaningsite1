import { memo, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Benefits } from './components/Benefits';
import { Reviews } from './components/Reviews';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { ScrollProgress } from './components/ScrollProgress';
import { ParticlesBackground } from './components/ParticlesBackground';
import { PricingPage } from './pages/PricingPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { GalleryPage } from './pages/GalleryPage';
import { BlogPage } from './pages/BlogPage';
import { AdminPanel } from './pages/AdminPanel';

const HomePage = memo(({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <>
    <Hero />
    <Services />
    <Benefits />
    <Reviews onNavigate={onNavigate} />
    <ContactForm />
  </>
));

HomePage.displayName = 'HomePage';

const App = memo(() => {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    // Check for admin access via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    if (pageParam === 'admin') {
      setCurrentPage('admin');
      // Clean up URL without page refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'pricing':
        return <PricingPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'blog':
        return <BlogPage />;
      case 'admin':
        return <AdminPanel />;
      case 'home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background relative">
        <ScrollProgress />
        <ParticlesBackground />
        <Header currentPage={currentPage} onNavigate={setCurrentPage} />
        <main>
          {renderPage()}
        </main>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </ThemeProvider>
  );
});

App.displayName = 'App';

export default App;
