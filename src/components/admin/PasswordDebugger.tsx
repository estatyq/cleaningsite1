import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Copy, Check, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PasswordDebuggerProps {
  password: string;
}

export function PasswordDebugger({ password }: PasswordDebuggerProps) {
  const [copied, setCopied] = useState(false);
  const [sessionPassword, setSessionPassword] = useState<string | null>(null);

  useEffect(() => {
    checkSessionStorage();
  }, []);

  const checkSessionStorage = () => {
    const stored = sessionStorage.getItem('adminPassword');
    setSessionPassword(stored);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Скопійовано в буфер обміну');
    setTimeout(() => setCopied(false), 2000);
  };

  const clearSession = () => {
    sessionStorage.removeItem('adminPassword');
    checkSessionStorage();
    toast.success('SessionStorage очищено');
  };

  const correctPassword = 'admin123';
  const isPasswordCorrect = password === correctPassword;
  const isSessionCorrect = sessionPassword === correctPassword;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Діагностика пароля
        </CardTitle>
        <CardDescription>
          Перевірте, який пароль використовується зараз
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Password in Component */}
        <div className="p-4 bg-background/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Пароль в компоненті:
            </span>
            {isPasswordCorrect ? (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                ✓ Правильний
              </Badge>
            ) : (
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                ✗ Неправильний
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded font-mono text-sm">
              {password || '(порожньо)'}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(password)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Довжина: {password?.length || 0} символів
          </div>
        </div>

        {/* SessionStorage Password */}
        <div className="p-4 bg-background/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Пароль в SessionStorage:
            </span>
            {sessionPassword ? (
              isSessionCorrect ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                  ✓ Правильний
                </Badge>
              ) : (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                  ✗ Неправильний
                </Badge>
              )
            ) : (
              <Badge className="bg-muted/50 text-muted-foreground">
                Порожньо
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded font-mono text-sm">
              {sessionPassword || '(порожньо)'}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={checkSessionStorage}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            {sessionPassword && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSession}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Довжина: {sessionPassword?.length || 0} символів
          </div>
        </div>

        {/* Expected Password */}
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Очікуваний пароль:
            </span>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              Сервер
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-background rounded font-mono text-sm text-primary">
              {correctPassword}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(correctPassword)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Довжина: {correctPassword.length} символів
          </div>
        </div>

        {/* Comparison */}
        {!isPasswordCorrect && password && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive/30 rounded-lg">
            <div className="text-sm font-medium text-destructive mb-2">
              ⚠️ Виявлено невідповідність!
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Ви використовуєте: <code className="bg-background/50 px-1 rounded">{password}</code></div>
              <div>• Потрібно використати: <code className="bg-background/50 px-1 rounded text-primary">{correctPassword}</code></div>
              <div className="mt-2 pt-2 border-t border-destructive/20">
                <strong>Рішення:</strong> Вийдіть і увійдіть з паролем <code className="bg-background/50 px-1 rounded text-primary">{correctPassword}</code>
              </div>
            </div>
          </div>
        )}

        {isPasswordCorrect && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <div className="text-sm font-medium text-green-500">
              ✓ Пароль правильний!
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Якщо ви все ще бачите помилки 401, перевірте логи Edge Function
            </div>
          </div>
        )}

        {/* Character Analysis */}
        {password && password !== correctPassword && (
          <details className="p-4 bg-background/50 rounded-lg border border-border">
            <summary className="text-sm font-medium cursor-pointer">
              🔬 Детальний аналіз (для розробників)
            </summary>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Ваш пароль (hex):</span><br />
                <code className="text-destructive">
                  {Array.from(password).map(char => 
                    char.charCodeAt(0).toString(16).padStart(2, '0')
                  ).join(' ')}
                </code>
              </div>
              <div>
                <span className="text-muted-foreground">Очікується (hex):</span><br />
                <code className="text-primary">
                  {Array.from(correctPassword).map(char => 
                    char.charCodeAt(0).toString(16).padStart(2, '0')
                  ).join(' ')}
                </code>
              </div>
              <div className="pt-2 text-muted-foreground">
                Перевірте на наявність прихованих символів (пробіли, табуляція тощо)
              </div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
