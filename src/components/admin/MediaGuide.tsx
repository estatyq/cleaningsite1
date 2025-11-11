import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Image, Video, Link2, CheckCircle2, XCircle, 
  Info, ExternalLink, FileImage, Youtube,
  Copy, CloudUpload
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { MediaValidator } from './MediaValidator';

export const MediaGuide: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('✅ Скопійовано в буфер обміну!');
  };

  return (
    <div className="space-y-6">
      {/* Validator */}
      <MediaValidator />

      <Separator />
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" />
            Інструкція: Як правильно завантажувати зображення та відео
          </CardTitle>
          <CardDescription>
            Важливо! Читайте уважно, щоб медіафайли коректно відображались на сайті
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Alert */}
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <Info className="w-4 h-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500/90">
              <strong>Важливо:</strong> Система працює тільки з прямими посиланнями на файли, а не зі сторінками сайтів!
            </AlertDescription>
          </Alert>

          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Зображення (фото)</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-500">✅ Правильні посилання</p>
                    <p className="text-sm text-green-500/80 mt-1">
                      Посилання повинно закінчуватись на розширення файлу (.jpg, .png, .webp, .gif)
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm font-mono bg-black/20 rounded p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-green-400 text-xs break-all">
                      https://images.unsplash.com/photo-1234567890?w=800
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0 h-6 w-6 p-0"
                      onClick={() => copyToClipboard('https://images.unsplash.com/photo-1234567890?w=800')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-green-400 text-xs break-all">
                      https://i.imgur.com/abc123.jpg
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0 h-6 w-6 p-0"
                      onClick={() => copyToClipboard('https://i.imgur.com/abc123.jpg')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-green-400 text-xs break-all">
                      https://example.com/images/photo.png
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-shrink-0 h-6 w-6 p-0"
                      onClick={() => copyToClipboard('https://example.com/images/photo.png')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-500">❌ Неправильні посилання</p>
                    <p className="text-sm text-red-500/80 mt-1">
                      Посилання на сторінки сайтів, а не на самі файли
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm font-mono bg-black/20 rounded p-3">
                  <code className="text-red-400 text-xs break-all block">
                    https://unsplash.com/photos/abc123 ❌
                  </code>
                  <code className="text-red-400 text-xs break-all block">
                    https://imgur.com/gallery/abc123 ❌
                  </code>
                  <code className="text-red-400 text-xs break-all block">
                    https://google.com/search?q=photo ❌
                  </code>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Video Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Відео</h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-500">✅ Правильні посилання</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm font-mono bg-black/20 rounded p-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">YouTube (будь-яке посилання):</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-green-400 text-xs break-all">
                        https://www.youtube.com/watch?v=dQw4w9WgXcQ
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 h-6 w-6 p-0"
                        onClick={() => copyToClipboard('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">YouTube короткий формат:</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-green-400 text-xs break-all">
                        https://youtu.be/dQw4w9WgXcQ
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 h-6 w-6 p-0"
                        onClick={() => copyToClipboard('https://youtu.be/dQw4w9WgXcQ')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Прямі посилання на файли (.mp4, .webm):</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-green-400 text-xs break-all">
                        https://example.com/videos/video.mp4
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-shrink-0 h-6 w-6 p-0"
                        onClick={() => copyToClipboard('https://example.com/videos/video.mp4')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Рекомендовані сервіси для завантаження</h3>
            </div>

            <div className="grid gap-3">
              <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default">Для зображень</Badge>
                      <h4 className="font-medium">Imgur</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Безкоштовний хостинг зображень без реєстрації
                    </p>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-primary">1.</span>
                        <span>Відкрийте <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">imgur.com/upload <ExternalLink className="w-3 h-3" /></a></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">2.</span>
                        <span>Завантажте зображення</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">3.</span>
                        <span>Натисніть правою кнопкою на зображення → "Копіювати адресу зображення"</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">4.</span>
                        <span>Вставте посилання в поле (має починатись з <code className="text-xs bg-accent/30 px-1 rounded">https://i.imgur.com/</code>)</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default">Для зображень</Badge>
                      <h4 className="font-medium">Unsplash</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Безкоштовні професійні фотографії високої якості
                    </p>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-primary">1.</span>
                        <span>Відкрийте <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">unsplash.com <ExternalLink className="w-3 h-3" /></a></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">2.</span>
                        <span>Знайдіть потрібне зображення</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">3.</span>
                        <span>Натисніть на зображення, щоб відкрити його у повному розмірі</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">4.</span>
                        <span>Натисніть правою кнопкою → "Копіювати адресу зображення"</span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">Для відео</Badge>
                      <h4 className="font-medium flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Найпростіший спосіб додати відео
                    </p>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="text-primary">1.</span>
                        <span>Завантажте відео на YouTube</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">2.</span>
                        <span>Скопіюйте посилання з адресного рядка браузера</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary">3.</span>
                        <span>Вставте у поле - система автоматично визначить відео</span>
                      </div>
                    </div>
                  </div>
                  <Youtube className="w-4 h-4 text-red-500 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Testing */}
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-blue-500/90">
              <strong>💡 Порада:</strong> Після додавання медіафайлу, перевірте чи він відображається на сторінці. 
              Якщо ні - перевірте посилання за допомогою інструкцій вище.
            </AlertDescription>
          </Alert>

          <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Як перевірити чи посилання правильне?
            </h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Скопіюйте посилання в новій вкладці браузера</li>
              <li>Натисніть Enter</li>
              <li>Якщо відкрилось тільки зображення/відео (без сторінки сайту) - посилання правильне ✅</li>
              <li>Якщо відкрилась сторінка з кнопками та текстом - посилання неправильне ❌</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
