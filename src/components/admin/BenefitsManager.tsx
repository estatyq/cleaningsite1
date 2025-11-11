import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Image as ImageIcon, Check, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface BenefitsManagerProps {
  password: string;
}

interface BenefitsData {
  image: string;
}

export function BenefitsManager({ password }: BenefitsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1758523670634-df4e12ed7a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGVhbiUyMGhvbWV8ZW58MXx8fHwxNzYyNjgwODIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral');

  useEffect(() => {
    loadBenefits();
  }, []);

  const loadBenefits = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/benefits`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.image) {
          setImage(data.data.image);
        }
      }
    } catch (error) {
      console.error('Error loading benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!image.trim()) {
      toast.error('Вкажіть URL зображення');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/benefits`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
            'X-Admin-Password': password,
          },
          body: JSON.stringify({ image }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save benefits');
      }

      toast.success('Зображення збережено!');
    } catch (error) {
      console.error('Error saving benefits:', error);
      toast.error('Помилка збереження зображення');
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
            <CardTitle>Зображення "Чому обирають нас"</CardTitle>
          </div>
          <CardDescription>
            Налаштуйте зображення для секції переваг на головній сторінці
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
            <Label className="text-base">URL зображення *</Label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Відображається праворуч від списку переваг
            </p>
            
            {image && (
              <div className="relative overflow-hidden rounded-lg border border-border bg-background/20">
                <img
                  src={image}
                  alt="Benefits preview"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2"
                    onClick={() => window.open(image, '_blank', 'noopener,noreferrer')}
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
      <Card className="bg-card/30 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-base">💡 Підказки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Рекомендовані розміри:</strong> Мінімум 800x600px для кращої якості
          </p>
          <p>
            <strong>Формати:</strong> JPG, PNG, WebP
          </p>
          <p>
            <strong>Джерела:</strong> Unsplash, Pexels або власні зображення
          </p>
          <p className="text-xs">
            Зображення має гарно виглядати з фіолетовим неоновим ефектом (neon-glow-purple)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
