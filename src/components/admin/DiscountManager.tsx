import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Percent, Check, Loader2, Tag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getDiscount, updateDiscount } from '../../utils/api';
import { Switch } from '../ui/switch';
import { handleApiError } from '../../utils/errorHandler';

interface DiscountManagerProps {
  password: string;
}

interface DiscountData {
  enabled: boolean;
  percentage: number;
  description: string;
}

export function DiscountManager({ password }: DiscountManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [discount, setDiscount] = useState<DiscountData>({
    enabled: true,
    percentage: 20,
    description: 'Знижка на перше замовлення'
  });

  useEffect(() => {
    loadDiscount();
  }, []);

  const loadDiscount = async () => {
    setLoading(true);
    try {
      const response = await getDiscount();
      if (response.data) {
        setDiscount(response.data);
      }
    } catch (error) {
      console.error('Error loading discount:', error);
      handleApiError(error, 'Помилка завантаження знижки');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (discount.percentage < 0 || discount.percentage > 100) {
      toast.error('Відсоток знижки має бути від 0 до 100');
      return;
    }

    if (!discount.description.trim()) {
      toast.error('Вкажіть опис знижки');
      return;
    }

    setSaving(true);
    try {
      await updateDiscount(password, discount);
      toast.success('Знижку збережено!');
    } catch (error) {
      console.error('Error saving discount:', error);
      handleApiError(error, 'Помилка збереження знижки');
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
            <Percent className="w-5 h-5 text-primary" />
            <CardTitle>Знижка на перше замовлення</CardTitle>
          </div>
          <CardDescription>
            Налаштуйте знижку для нових клієнтів
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border">
            <div className="space-y-1">
              <Label className="text-base">Показувати знижку</Label>
              <p className="text-sm text-muted-foreground">
                Відображати бейдж зі знижкою на головній сторінці
              </p>
            </div>
            <Switch
              checked={discount.enabled}
              onCheckedChange={(checked) => setDiscount({ ...discount, enabled: checked })}
            />
          </div>

          {/* Percentage */}
          <div className="space-y-2">
            <Label>Відсоток знижки *</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={discount.percentage}
                onChange={(e) => setDiscount({ ...discount, percentage: parseInt(e.target.value) || 0 })}
                className="bg-background/50"
              />
              <span className="text-2xl text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Від 0 до 100 відсотків
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Опис знижки *</Label>
            <Textarea
              value={discount.description}
              onChange={(e) => setDiscount({ ...discount, description: e.target.value })}
              placeholder="Знижка на перше замовлення"
              className="bg-background/50"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Короткий опис що відображається на бейджі
            </p>
          </div>

          {/* Preview */}
          {discount.enabled && (
            <div className="p-4 bg-background/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-2">Попередній перегляд:</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full">
                <Tag className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">
                  {discount.description}: <strong>{discount.percentage}%</strong>
                </span>
              </div>
            </div>
          )}

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
                Зберегти знижку
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
              <li>Знижка відображається в Hero секції на головній</li>
              <li>Можна тимчасово вимкнути без видалення</li>
              <li>Стандартна знижка: 20%</li>
              <li>Можна змінити опис для різних акцій</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
