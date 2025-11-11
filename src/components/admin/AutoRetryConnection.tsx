import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Loader2 } from 'lucide-react';
import { checkConnection } from '../../utils/checkConnection';

interface AutoRetryConnectionProps {
  onSuccess: () => void;
  maxAttempts?: number;
  children: React.ReactNode;
}

export function AutoRetryConnection({ 
  onSuccess, 
  maxAttempts = 5,
  children 
}: AutoRetryConnectionProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState('Перевірка з\'єднання...');

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number;

    const tryConnect = async (attemptNumber: number) => {
      if (!isMounted) return;

      setAttempt(attemptNumber);
      setMessage(`Спроба ${attemptNumber} з ${maxAttempts}...`);

      const status = await checkConnection();

      if (!isMounted) return;

      if (status.success) {
        setMessage('З\'єднання встановлено! ✅');
        setTimeout(() => {
          if (isMounted) {
            setIsChecking(false);
            onSuccess();
          }
        }, 500);
      } else if (attemptNumber < maxAttempts) {
        setMessage(`Очікування... Наступна спроба через 3 секунди`);
        timeoutId = window.setTimeout(() => {
          tryConnect(attemptNumber + 1);
        }, 3000);
      } else {
        setMessage('Не вдалося встановити з\'єднання ❌');
        setTimeout(() => {
          if (isMounted) {
            setIsChecking(false);
          }
        }, 1000);
      }
    };

    tryConnect(1);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [maxAttempts, onSuccess]);

  if (!isChecking) {
    return <>{children}</>;
  }

  const progress = (attempt / maxAttempts) * 100;

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">{message}</p>
            <div className="w-64">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center max-w-md">
            <p>Edge Function розгортається або запускається.</p>
            <p>Це може зайняти до 30 секунд при першому запуску.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
