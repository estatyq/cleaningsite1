import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle2, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface AccountManagerProps {
  password: string;
  onPasswordChanged: (newPassword: string) => void;
}

export const AccountManager = memo(({ password, onPasswordChanged }: AccountManagerProps) => {
  const [username, setUsername] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    await Promise.all([
      loadUsername(),
      checkPasswordStatus()
    ]);
  };

  const loadUsername = async () => {
    setLoadingUsername(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/admin-username`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsername(data.data.username || '');
      }
    } catch (error) {
      console.error('Error loading username:', error);
    } finally {
      setLoadingUsername(false);
    }
  };

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/password-status`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsDefault(data.data.isDefault);
      }
    } catch (error) {
      console.error('Error checking password status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Введіть ім\'я користувача');
      return;
    }

    if (username.length < 3) {
      toast.error('Ім\'я користувача повинно містити мінімум 3 символи');
      return;
    }

    setSavingUsername(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/admin-username`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
          body: JSON.stringify({ username: username.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update username');
      }

      toast.success('Ім\'я користувача успішно оновлено!');
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast.error(error.message || 'Помилка оновлення імені');
    } finally {
      setSavingUsername(false);
    }
  };

  const validatePasswordForm = () => {
    if (!currentPassword) {
      toast.error('Введіть поточний пароль');
      return false;
    }

    if (!newPassword) {
      toast.error('Введіть новий пароль');
      return false;
    }

    if (newPassword.length < 6) {
      toast.error('Новий пароль повинен містити мінімум 6 символів');
      return false;
    }

    if (newPassword === currentPassword) {
      toast.error('Новий пароль повинен відрізнятися від поточного');
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Паролі не співпадають');
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setLoadingPassword(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Update password in parent component and session storage
      onPasswordChanged(newPassword);
      sessionStorage.setItem('adminPassword', newPassword);

      toast.success('Пароль успішно змінено! Ви вже авторизовані з новим паролем.');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Update status
      setIsDefault(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Помилка зміни пароля');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Username Card */}
      <Card className="bg-card/30 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Ім'я користувача</CardTitle>
              <CardDescription>
                Це ім'я відображатиметься в системі (не використовується для входу)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Ім'я користувача *</Label>
              {loadingUsername ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Завантаження...
                </div>
              ) : (
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введіть ім'я (мінімум 3 символи)"
                  required
                  minLength={3}
                />
              )}
              <p className="text-xs text-muted-foreground">
                Це ім'я тільки для відображення. Для входу в систему використовується пароль. Мінімум 3 символи.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={savingUsername || loadingUsername}
            >
              {savingUsername ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Збереження...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Зберегти ім'я
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card className="bg-card/30 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Зміна пароля адміністратора</CardTitle>
              <CardDescription>
                Змініть пароль для підвищення безпеки системи
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!statusLoading && isDefault && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500">
                <strong>Увага!</strong> Ви використовуєте стандартний пароль. 
                Рекомендуємо змінити його на більш безпечний.
              </AlertDescription>
            </Alert>
          )}

          {!statusLoading && !isDefault && (
            <Alert className="bg-green-500/10 border-green-500/30">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Ви використовуєте власний пароль. Систему захищено.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Поточний пароль *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введіть поточний пароль"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новий пароль *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Мінімум 6 символів"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Використовуйте мінімум 6 символів. Рекомендуємо комбінацію літер, цифр та спецсимволів.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Підтвердіть новий пароль *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторіть новий пароль"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full neon-glow"
              disabled={loadingPassword}
            >
              <Lock className="w-4 h-4 mr-2" />
              {loadingPassword ? 'Збереження...' : 'Змінити пароль'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">💡 Рекомендації щодо безпеки:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Використовуйте унікальний пароль, який ви не використовуєте в інших місцях</li>
                <li>• Комбінуйте великі та малі літери, цифри та спецсимволи</li>
                <li>• Уникайте очевидних паролів (дати народження, імена тощо)</li>
                <li>• Регулярно змінюйте пароль для підвищення безпеки</li>
                <li>• Не діліться паролем з іншими особами</li>
              </ul>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="text-sm font-medium">ℹ️ Важлива інформація:</h4>
              <p className="text-xs text-muted-foreground">
                Після зміни пароля ви залишаєтесь авторизованими з новим паролем. 
                При наступному вході використовуйте саме новий пароль, який ви щойно встановили.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AccountManager.displayName = 'AccountManager';
