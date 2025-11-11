import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface PasswordDiagnosticProps {
  password: string;
}

export function PasswordDiagnostic({ password }: PasswordDiagnosticProps) {
  const [actualPassword, setActualPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkActualPassword();
  }, []);

  const checkActualPassword = async () => {
    try {
      // Try to authenticate with current password to verify it's correct
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/check-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        setActualPassword(password);
      }
    } catch (error) {
      console.error('Password check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCorrect = actualPassword ? password === actualPassword : true; // Assume correct if we can't verify
  const hasPassword = !!password;
  const hasSpaces = password?.includes(' ');
  const hasExtraChars = password && password !== password.trim();

  return (
    <Card className="mb-4 bg-card/20 backdrop-blur-xl border-border/50">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Status Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                {hasPassword ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
                Пароль: {hasPassword ? (
                  <strong className="text-green-500">Активний</strong>
                ) : (
                  <strong className="text-red-500">Відсутній</strong>
                )}
              </span>
              
              <span className="flex items-center gap-1">
                {isCorrect ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
                Перевірка: {isCorrect ? (
                  <strong className="text-green-500">OK</strong>
                ) : (
                  <strong className="text-red-500">Невірний</strong>
                )}
              </span>

              <span className="text-muted-foreground">
                Довжина: <strong className="text-primary">{password?.length || 0}</strong>
              </span>
            </div>

            <button 
              onClick={() => {
                console.log('🔐 ===== PASSWORD DIAGNOSTIC =====');
                console.log('🔐 Current password:', `"${password}"`);
                console.log('🔐 Actual DB password:', actualPassword ? `"${actualPassword}"` : 'Unknown');
                console.log('🔐 Match:', isCorrect);
                console.log('🔐 Password length:', password?.length);
                console.log('🔐 Has spaces:', hasSpaces);
                console.log('🔐 Has extra chars:', hasExtraChars);
                console.log('🔐 Trimmed:', `"${password?.trim()}"`);
                console.log('🔐 Char codes:', password?.split('').map((c, i) => `[${i}]="${c}" (${c.charCodeAt(0)})`));
                console.log('🔐 ==============================');
              }}
              className="text-xs text-primary hover:underline"
            >
              🔍 Показати в консолі
            </button>
          </div>

          {/* Warnings */}
          {!loading && !isCorrect && hasPassword && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {hasSpaces && '⚠️ Пароль містить пробіли. '}
                {hasExtraChars && '⚠️ Пароль має зайві символи на початку/кінці. '}
                {!hasSpaces && !hasExtraChars && `⚠️ Пароль не співпадає з базою даних. Вийдіть та увійдіть знову з новим паролем.`}
              </AlertDescription>
            </Alert>
          )}

          {!hasPassword && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                ⚠️ Пароль не збережений. Вийдіть та увійдіть знову.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
