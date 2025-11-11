import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function PasswordResetBanner() {
  const [copied, setCopied] = useState(false);
  const [fixing, setFixing] = useState(false);

  const correctPassword = 'admin123';

  const copyPassword = () => {
    navigator.clipboard.writeText(correctPassword);
    setCopied(true);
    toast.success('Пароль скопійовано в буфер обміну');
    setTimeout(() => setCopied(false), 2000);
  };

  const fixNow = () => {
    setFixing(true);
    
    // Очистити storage
    sessionStorage.clear();
    localStorage.clear();
    
    toast.success('Кеш очищено! Перезавантаження...', {
      duration: 2000,
    });
    
    // Перезавантажити сторінку через 1.5 секунди
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Card className="bg-destructive/10 border-2 border-destructive animate-pulse-slow mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                🚨 Помилка авторизації (401 Unauthorized)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ви використовуєте неправильний пароль. У вашому браузері міг зберегтися старий пароль з попереднього входу.
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-4 border border-border">
              <p className="text-sm font-medium mb-2">Правильний пароль:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-background rounded font-mono text-lg text-primary border-2 border-primary/30">
                  {correctPassword}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPassword}
                  className="h-12"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⚠️ Введіть точно як написано, без пробілів
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={fixNow}
                disabled={fixing}
                className="bg-primary hover:bg-primary/90"
              >
                {fixing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Очищення...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Виправити автоматично
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  window.location.href = '/admin';
                }}
              >
                Вийти і увійти знову
              </Button>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-primary hover:underline">
                📖 Інструкція для ручного виправлення
              </summary>
              <div className="mt-3 space-y-2 pl-4 border-l-2 border-primary/30">
                <p><strong>Варіант 1: Через консоль браузера</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Натисніть F12 щоб відкрити консоль</li>
                  <li>Вставте: <code className="bg-background px-2 py-1 rounded">sessionStorage.clear(); location.reload();</code></li>
                  <li>Натисніть Enter</li>
                  <li>Увійдіть з паролем <code className="bg-background px-2 py-1 rounded text-primary">{correctPassword}</code></li>
                </ol>
                
                <p className="mt-3"><strong>Варіант 2: Очистіть cookies та кеш</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Chrome: Ctrl+Shift+Delete</li>
                  <li>Виберіть "Cookies та інші дані сайтів"</li>
                  <li>Натисніть "Очистити дані"</li>
                  <li>Перезавантажте сторінку</li>
                </ol>
              </div>
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
