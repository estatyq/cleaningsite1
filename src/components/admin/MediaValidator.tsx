import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, XCircle, Image as ImageIcon, Video, Loader2, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { isVideoUrl, getYouTubeEmbedUrl, getYouTubeVideoId } from '../../utils/videoHelpers';

export const MediaValidator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    type: 'image' | 'video' | 'unknown';
    message: string;
    preview?: string;
  } | null>(null);

  const validateUrl = async () => {
    if (!url.trim()) {
      setResult({
        valid: false,
        type: 'unknown',
        message: 'Будь ласка, введіть URL',
      });
      return;
    }

    setValidating(true);
    setResult(null);

    try {
      // Check if it's a URL
      const urlObj = new URL(url);

      // Check if it's a video
      if (isVideoUrl(url)) {
        const youtubeId = getYouTubeVideoId(url);
        if (youtubeId) {
          setResult({
            valid: true,
            type: 'video',
            message: '✅ YouTube відео знайдено!',
            preview: getYouTubeEmbedUrl(url) || undefined,
          });
        } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
          setResult({
            valid: true,
            type: 'video',
            message: '✅ Пряме посилання на відео файл',
            preview: url,
          });
        } else {
          setResult({
            valid: true,
            type: 'video',
            message: '✅ Відео URL (перевірте чи працює)',
            preview: url,
          });
        }
      }
      // Check if it's an image
      else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || url.includes('unsplash.com') || url.includes('imgur.com')) {
        // Try to load the image
        const img = new Image();
        img.onload = () => {
          setResult({
            valid: true,
            type: 'image',
            message: '✅ Зображення успішно завантажено!',
            preview: url,
          });
          setValidating(false);
        };
        img.onerror = () => {
          setResult({
            valid: false,
            type: 'image',
            message: '❌ Не вдалося завантажити зображення. Перевірте URL або доступність файлу.',
          });
          setValidating(false);
        };
        img.src = url;
        return; // Exit early, validation will complete in onload/onerror
      } else {
        setResult({
          valid: false,
          type: 'unknown',
          message: '⚠️ URL не схожий на зображення чи відео. Перевірте розширення файлу.',
        });
      }
    } catch (error) {
      setResult({
        valid: false,
        type: 'unknown',
        message: '❌ Невірний URL формат',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateUrl();
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Перевірка медіа-посилань
        </CardTitle>
        <CardDescription>
          Введіть URL зображення або відео для перевірки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">URL медіафайлу</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://i.imgur.com/example.jpg або https://youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button 
              onClick={validateUrl}
              disabled={validating || !url.trim()}
            >
              {validating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Перевірити'
              )}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-3">
            <Alert className={
              result.valid 
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }>
              {result.valid ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <AlertDescription className={
                result.valid ? 'text-green-500/90' : 'text-red-500/90'
              }>
                {result.message}
              </AlertDescription>
            </Alert>

            {result.valid && result.preview && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {result.type === 'image' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    Попередній перегляд
                  </Label>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Відкрити <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="rounded-lg overflow-hidden border border-border bg-black/20">
                  {result.type === 'image' ? (
                    <ImageWithFallback
                      src={result.preview}
                      alt="Preview"
                      className="w-full h-64 object-contain"
                    />
                  ) : result.preview.includes('youtube.com/embed/') ? (
                    <iframe
                      src={result.preview}
                      className="w-full h-64"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={result.preview}
                      controls
                      className="w-full h-64"
                    >
                      Ваш браузер не підтримує відео.
                    </video>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-xs text-muted-foreground break-all">
                    <strong>Перевірене посилання:</strong> {url}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
