import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Database, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DataDiagnosticProps {
  password: string;
}

export const DataDiagnostic = memo(({ password }: DataDiagnosticProps) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    const diagnosticResults: any = {
      reviews: { total: 0, withImages: 0, approved: 0, images: [] },
      gallery: { total: 0, photos: 0, videos: 0 },
      blog: { total: 0, withImages: 0, withVideos: 0 },
      heroImages: { mainImage: '', secondaryImage: '' },
      benefitsImage: ''
    };

    try {
      // Check Reviews
      const reviewsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/reviews/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        diagnosticResults.reviews.total = reviewsData.data.length;
        diagnosticResults.reviews.approved = reviewsData.data.filter((r: any) => r.approved).length;
        diagnosticResults.reviews.withImages = reviewsData.data.filter((r: any) => r.image && r.image.trim() !== '').length;
        diagnosticResults.reviews.images = reviewsData.data
          .filter((r: any) => r.image && r.image.trim() !== '')
          .map((r: any) => ({ name: r.name, image: r.image, approved: r.approved }));
      }

      // Check Gallery
      const galleryRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/gallery`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        diagnosticResults.gallery.total = galleryData.data.length;
        diagnosticResults.gallery.photos = galleryData.data.filter((g: any) => g.type === 'photo').length;
        diagnosticResults.gallery.videos = galleryData.data.filter((g: any) => g.type === 'video').length;
      }

      // Check Blog
      const blogRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/blog`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        diagnosticResults.blog.total = blogData.data.length;
        diagnosticResults.blog.withImages = blogData.data.filter((b: any) => b.image && b.image.trim() !== '').length;
        diagnosticResults.blog.withVideos = blogData.data.filter((b: any) => b.video && b.video.trim() !== '').length;
      }

      // Check Hero Images
      const heroRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/hero-images`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (heroRes.ok) {
        const heroData = await heroRes.json();
        diagnosticResults.heroImages = heroData.data || { mainImage: '', secondaryImage: '' };
      }

      // Check Benefits Image
      const benefitsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/benefits-image`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (benefitsRes.ok) {
        const benefitsData = await benefitsRes.json();
        diagnosticResults.benefitsImage = benefitsData.data?.imageUrl || '';
      }

      setResults(diagnosticResults);
      toast.success('Діагностика завершена!');
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('Помилка діагностики');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Діагностика зображень
        </CardTitle>
        <CardDescription>
          Перевірка всіх зображень у базі даних
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Перевірка...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Запустити діагностику
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4 mt-6">
            {/* Reviews */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Відгуки
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Всього: {results.reviews.total}</p>
                <p>Схвалено: {results.reviews.approved}</p>
                <p>З зображеннями: {results.reviews.withImages}</p>
                {results.reviews.images.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="font-medium">Зображення:</p>
                    {results.reviews.images.map((review: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {review.approved ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <XCircle className="w-3 h-3 text-yellow-500" />
                        )}
                        <span>{review.name}: </span>
                        <a 
                          href={review.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-xs"
                        >
                          {review.image}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Галерея
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Всього елементів: {results.gallery.total}</p>
                <p>Фотографій: {results.gallery.photos}</p>
                <p>Відео: {results.gallery.videos}</p>
              </div>
            </div>

            {/* Blog */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Блог
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Всього постів: {results.blog.total}</p>
                <p>З зображеннями: {results.blog.withImages}</p>
                <p>З відео: {results.blog.withVideos}</p>
              </div>
            </div>

            {/* Hero Images */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Hero зображення
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Головне: {results.heroImages.mainImage ? (
                  <a 
                    href={results.heroImages.mainImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Посилання
                  </a>
                ) : 'Немає'}</p>
                <p>Додаткове: {results.heroImages.secondaryImage ? (
                  <a 
                    href={results.heroImages.secondaryImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Посилання
                  </a>
                ) : 'Немає'}</p>
              </div>
            </div>

            {/* Benefits Image */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Benefits зображення
              </h4>
              <div className="text-sm text-muted-foreground">
                <p>{results.benefitsImage ? (
                  <a 
                    href={results.benefitsImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Посилання
                  </a>
                ) : 'Немає'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

DataDiagnostic.displayName = 'DataDiagnostic';
