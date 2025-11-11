import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Image as ImageIcon, Check, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getHeroImages, updateHeroImages } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

interface HeroImagesManagerProps {
  password: string;
}

interface HeroImages {
  mainImage: string;
  secondaryImage: string;
}

export function HeroImagesManager({ password }: HeroImagesManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<HeroImages>({
    mainImage: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
    secondaryImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await getHeroImages();
      if (response.data) {
        setImages(response.data);
      }
    } catch (error) {
      console.error('Error loading hero images:', error);
      handleApiError(error, 'Помилка завантаження зображень');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!images.mainImage.trim() || !images.secondaryImage.trim()) {
      toast.error('Вкажіть обидва URL зображень');
      return;
    }

    setSaving(true);
    try {
      await updateHeroImages(password, images);
      toast.success('Зображення збережено!');
    } catch (error) {
      console.error('Error saving hero images:', error);
      handleApiError(error, 'Помилка збереження зображень');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <CardTitle>Головні зображення</CardTitle>
          </div>
          <CardDescription>
            Налаштуйте фото для героїчної секції на головній сторінці
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Image */}
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
            <Label className="text-base">Основне зображення *</Label>
            <Input
              value={images.mainImage}
              onChange={(e) => setImages({ ...images, mainImage: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Відображається в центрі героїчної секції
            </p>
            
            {images.mainImage && (
              <div className="relative overflow-hidden rounded-lg border border-border bg-background/20">
                <img
                  src={images.mainImage}
                  alt="Main preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2"
                    onClick={() => window.open(images.mainImage, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Secondary Image */}
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
            <Label className="text-base">Додаткове зображення *</Label>
            <Input
              value={images.secondaryImage}
              onChange={(e) => setImages({ ...images, secondaryImage: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Відображається збоку в героїчній секції
            </p>
            
            {images.secondaryImage && (
              <div className="relative overflow-hidden rounded-lg border border-border bg-background/20">
                <img
                  src={images.secondaryImage}
                  alt="Secondary preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2"
                    onClick={() => window.open(images.secondaryImage, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/80"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Збереження...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Зберегти зображення
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 <strong>Підказка:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Використовуйте URL посилання на зображення (не завантаження файлів)</li>
              <li>Рекомендований формат: JPG, PNG</li>
              <li>Рекомендований розмір: мінімум 800x600px</li>
              <li>Можна використати Unsplash, Imgur або інші хостинги</li>
              <li>Приклад: https://images.unsplash.com/photo-...</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">🔗 <strong>Корисні ресурси для зображень:</strong></p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => window.open('https://unsplash.com/s/photos/cleaning', '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Unsplash (прибирання)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => window.open('https://www.pexels.com/search/cleaning/', '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Pexels (прибирання)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => window.open('https://imgur.com/upload', '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Imgur (завантажити)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
