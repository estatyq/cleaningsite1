import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, Upload, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getBranding, updateBranding, getSocialMedia, updateSocialMedia } from '../../utils/api';
import { Checkbox } from '../ui/checkbox';
import { handleApiError } from '../../utils/errorHandler';

interface BrandingManagerProps {
  password: string;
}

interface BrandingData {
  logo: string;
  companyName: string;
}

interface SocialMedia {
  facebook: { url: string; enabled: boolean };
  instagram: { url: string; enabled: boolean };
}

export function BrandingManager({ password }: BrandingManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingData>({
    logo: '',
    companyName: 'БлискКлінінг'
  });
  const [social, setSocial] = useState<SocialMedia>({
    facebook: { url: '', enabled: false },
    instagram: { url: '', enabled: false }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brandingRes, socialRes] = await Promise.all([
        getBranding(),
        getSocialMedia()
      ]);

      if (brandingRes.data) {
        setBranding(brandingRes.data);
      }
      if (socialRes.data) {
        setSocial(socialRes.data);
      }
    } catch (error) {
      console.error('Error loading branding data:', error);
      handleApiError(error, 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!branding.companyName.trim()) {
      toast.error('Вкажіть назву компанії');
      return;
    }

    setSaving(true);
    try {
      await updateBranding(password, branding);
      toast.success('Брендинг збережено!');
      // Notify other components to refresh
      window.dispatchEvent(new Event('brandingUpdated'));
    } catch (error) {
      console.error('Error saving branding:', error);
      handleApiError(error, 'Помилка збереження брендингу');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    setSaving(true);
    try {
      await updateSocialMedia(password, social);
      toast.success('Соціальні мережі збережено!');
      // Notify other components to refresh
      window.dispatchEvent(new Event('socialMediaUpdated'));
    } catch (error) {
      console.error('Error saving social media:', error);
      handleApiError(error, 'Помилка збереження соціальних мереж');
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
      {/* Branding Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Логотип та назва компанії</CardTitle>
          </div>
          <CardDescription>
            Налаштуйте логотип та назву вашої компанії
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Назва компанії *</Label>
            <Input
              value={branding.companyName}
              onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
              placeholder="БлискКлінінг"
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Відображається в хедері та футері
            </p>
          </div>

          <div className="space-y-2">
            <Label>URL логотипа (опціонально)</Label>
            <div className="flex gap-2">
              <Input
                value={branding.logo}
                onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-background/50"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled
                title="Завантаження файлів"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Якщо не вказано, буде використано іконку за замовчуванням
            </p>
          </div>

          {branding.logo && (
            <div className="p-4 bg-background/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Попередній перегляд:</p>
              <div className="flex items-center gap-2">
                <img 
                  src={branding.logo} 
                  alt="Logo preview" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-foreground">{branding.companyName}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveBranding}
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
                Зберегти брендинг
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
        <CardHeader>
          <CardTitle>Соціальні мережі</CardTitle>
          <CardDescription>
            Додайте посилання на ваші соціальні мережі
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facebook */}
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base">Facebook</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={social.facebook.enabled}
                  onCheckedChange={(checked) =>
                    setSocial({
                      ...social,
                      facebook: { ...social.facebook, enabled: checked as boolean }
                    })
                  }
                  id="facebook-enabled"
                />
                <label
                  htmlFor="facebook-enabled"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Показувати у футері
                </label>
              </div>
            </div>
            <Input
              value={social.facebook.url}
              onChange={(e) =>
                setSocial({
                  ...social,
                  facebook: { ...social.facebook, url: e.target.value }
                })
              }
              placeholder="https://facebook.com/yourpage"
              className="bg-background/50"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-3 p-4 bg-background/30 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <Label className="text-base">Instagram</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={social.instagram.enabled}
                  onCheckedChange={(checked) =>
                    setSocial({
                      ...social,
                      instagram: { ...social.instagram, enabled: checked as boolean }
                    })
                  }
                  id="instagram-enabled"
                />
                <label
                  htmlFor="instagram-enabled"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Показувати у футері
                </label>
              </div>
            </div>
            <Input
              value={social.instagram.url}
              onChange={(e) =>
                setSocial({
                  ...social,
                  instagram: { ...social.instagram, url: e.target.value }
                })
              }
              placeholder="https://instagram.com/yourpage"
              className="bg-background/50"
            />
          </div>

          <Button
            onClick={handleSaveSocial}
            disabled={saving}
            className="w-full bg-secondary hover:bg-secondary/80"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Збереження...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Зберегти соціальні мережі
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
              <li>Логотип відображається в хедері та футері сайту</li>
              <li>Назва компанії синхронізується на всіх сторінках</li>
              <li>Іконки соцмереж показуються тільки якщо стоїть галочка</li>
              <li>Посилання можуть бути порожніми - тоді іконка не буде клікабельна</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
