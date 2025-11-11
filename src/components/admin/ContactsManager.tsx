import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Plus, Trash2, Loader2, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getContacts, updateContacts } from '../../utils/api';

interface PhoneNumber {
  number: string;
  viber: boolean;
  telegram: boolean;
  whatsapp: boolean;
}

interface Contacts {
  phones: PhoneNumber[];
  email: string;
  address: string;
  schedule: string;
}

export const ContactsManager = memo(({ password }: { password: string }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Contacts>({
    phones: [{ number: '', viber: false, telegram: false, whatsapp: false }],
    email: '',
    address: '',
    schedule: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await getContacts();
      if (response.data && Object.keys(response.data).length > 0) {
        setFormData({
          phones: response.data.phones?.length > 0 
            ? response.data.phones 
            : [{ number: '', viber: false, telegram: false, whatsapp: false }],
          email: response.data.email || '',
          address: response.data.address || '',
          schedule: response.data.schedule || '',
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        toast.error(error.message);
        window.dispatchEvent(new Event('unauthorized'));
      } else {
        toast.error('Помилка завантаження контактів');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Filter out empty phone numbers
    const phones = formData.phones.filter(p => p.number.trim() !== '');

    if (phones.length === 0) {
      toast.error('Додайте хоча б один номер телефону');
      setSaving(false);
      return;
    }

    try {
      await updateContacts(password, {
        ...formData,
        phones,
      });
      toast.success('Контакти оновлено!');
      await loadContacts();
      // Notify other components to refresh
      window.dispatchEvent(new Event('contactsUpdated'));
    } catch (error) {
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        toast.error(error.message);
        window.dispatchEvent(new Event('unauthorized'));
      } else {
        toast.error('Помилка збереження');
      }
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...formData.phones, { number: '', viber: false, telegram: false, whatsapp: false }],
    });
  };

  const removePhone = (index: number) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      phones: newPhones.length > 0 ? newPhones : [{ number: '', viber: false, telegram: false, whatsapp: false }],
    });
  };

  const updatePhone = (index: number, field: keyof PhoneNumber, value: string | boolean) => {
    const newPhones = [...formData.phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setFormData({
      ...formData,
      phones: newPhones,
    });
  };

  if (loading) {
    return <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />;
  }

  return (
    <Card className="bg-card/30 backdrop-blur-xl border-border">
      <CardHeader>
        <CardTitle>Контактна інформація</CardTitle>
        <CardDescription>
          Управління контактами, які відображаються у футері та контактній формі
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Numbers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Номери телефонів
              </Label>
              <Button type="button" size="sm" variant="outline" onClick={addPhone}>
                <Plus className="w-4 h-4 mr-1" />
                Додати номер
              </Button>
            </div>
            
            {formData.phones.map((phone, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={phone.number}
                    onChange={(e) => updatePhone(index, 'number', e.target.value)}
                    placeholder="+380 (12) 345-67-89"
                    className="flex-1"
                  />
                  {formData.phones.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removePhone(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`viber-${index}`}
                      checked={phone.viber}
                      onCheckedChange={(checked) => updatePhone(index, 'viber', checked as boolean)}
                    />
                    <Label htmlFor={`viber-${index}`} className="text-sm cursor-pointer flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-purple-500" />
                      Viber
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`telegram-${index}`}
                      checked={phone.telegram}
                      onCheckedChange={(checked) => updatePhone(index, 'telegram', checked as boolean)}
                    />
                    <Label htmlFor={`telegram-${index}`} className="text-sm cursor-pointer flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-blue-500" />
                      Telegram
                    </Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`whatsapp-${index}`}
                      checked={phone.whatsapp}
                      onCheckedChange={(checked) => updatePhone(index, 'whatsapp', checked as boolean)}
                    />
                    <Label htmlFor={`whatsapp-${index}`} className="text-sm cursor-pointer flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-green-500" />
                      WhatsApp
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@bliskcleaning.ua"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Адреса
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Київ, Україна"
              required
            />
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Графік роботи
            </Label>
            <Textarea
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="Пн-Нд: 24/7"
              rows={2}
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full neon-glow">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Збереження...
              </>
            ) : (
              'Зберегти контакти'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
});

ContactsManager.displayName = 'ContactsManager';
