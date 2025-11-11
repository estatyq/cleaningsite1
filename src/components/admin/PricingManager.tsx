import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Loader2, DollarSign, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

interface CleaningItem {
  area: string;
  afterRepair: string;
  general: string;
  supporting: string;
}

interface WindowItem {
  type: string;
  price: string;
}

interface ChemistryItem {
  item: string;
  price: string;
}

interface AdditionalItem {
  service: string;
  price: string;
}

interface PricingData {
  cleaning: CleaningItem[];
  windows: WindowItem[];
  chemistry: ChemistryItem[];
  additional: AdditionalItem[];
}

interface PricingManagerProps {
  password: string;
}

export const PricingManager = memo(({ password }: PricingManagerProps) => {
  const [pricing, setPricing] = useState<PricingData>({
    cleaning: [],
    windows: [],
    chemistry: [],
    additional: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [editingItem, setEditingItem] = useState<{ category: keyof PricingData; index: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<keyof PricingData>('cleaning');
  
  // Different form states for different categories
  const [cleaningForm, setCleaningForm] = useState({ area: '', afterRepair: '', general: '', supporting: '' });
  const [windowForm, setWindowForm] = useState({ type: '', price: '' });
  const [chemistryForm, setChemistryForm] = useState({ item: '', price: '' });
  const [additionalForm, setAdditionalForm] = useState({ service: '', price: '' });

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      console.log('📊 Loading pricing data...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/pricing`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load pricing');
      }

      const data = await response.json();
      console.log('📊 Pricing response:', data);
      
      const pricingMap: any = {
        cleaning: [],
        windows: [],
        chemistry: [],
        additional: [],
      };
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        data.data.forEach((item: any) => {
          if (item && item.key && typeof item.key === 'string') {
            const key = item.key.replace('price:', '');
            console.log('📊 Processing pricing item:', key, item.value);
            if (pricingMap.hasOwnProperty(key)) {
              pricingMap[key] = item.value || [];
            }
          }
        });
      } else {
        console.log('📊 No pricing data found, using empty defaults');
      }

      setPricing(pricingMap);
      console.log('📊 Pricing loaded:', pricingMap);
    } catch (error) {
      console.error('Error loading pricing:', error);
      toast.error('Помилка завантаження цін');
    } finally {
      setLoading(false);
    }
  };

  const savePricing = async (category: keyof PricingData, items: any[]) => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/pricing/${category}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
          body: JSON.stringify({ items }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save pricing');
      }

      toast.success('Ціни збережено!');
      await loadPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('Помилка збереження цін');
    } finally {
      setSaving(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const { initializePricing } = await import('../../utils/initializeData');
      await initializePricing(password);
      await loadPricing();
      toast.success('Початкові дані завантажено!');
    } catch (error) {
      console.error('Error initializing pricing:', error);
      toast.error('Помилка ініціалізації');
    } finally {
      setInitializing(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let newItem: any;
    let updatedItems: any[];

    switch (newItemCategory) {
      case 'cleaning':
        newItem = { ...cleaningForm };
        updatedItems = [...pricing.cleaning, newItem];
        setCleaningForm({ area: '', afterRepair: '', general: '', supporting: '' });
        break;
      case 'windows':
        newItem = { ...windowForm };
        updatedItems = [...pricing.windows, newItem];
        setWindowForm({ type: '', price: '' });
        break;
      case 'chemistry':
        newItem = { ...chemistryForm };
        updatedItems = [...pricing.chemistry, newItem];
        setChemistryForm({ item: '', price: '' });
        break;
      case 'additional':
        newItem = { ...additionalForm };
        updatedItems = [...pricing.additional, newItem];
        setAdditionalForm({ service: '', price: '' });
        break;
      default:
        return;
    }

    await savePricing(newItemCategory, updatedItems);
    setDialogOpen(false);
  };

  const handleUpdateItem = async (category: keyof PricingData, index: number) => {
    const updatedItems = [...pricing[category]];
    await savePricing(category, updatedItems);
    setEditingItem(null);
  };

  const handleDeleteItem = async (category: keyof PricingData, index: number) => {
    const updatedItems = pricing[category].filter((_, i) => i !== index);
    await savePricing(category, updatedItems);
  };

  const updateCleaningField = (index: number, field: keyof CleaningItem, value: string) => {
    const updated = [...pricing.cleaning];
    updated[index] = { ...updated[index], [field]: value };
    setPricing({ ...pricing, cleaning: updated });
  };

  const updateWindowField = (index: number, field: keyof WindowItem, value: string) => {
    const updated = [...pricing.windows];
    updated[index] = { ...updated[index], [field]: value };
    setPricing({ ...pricing, windows: updated });
  };

  const updateChemistryField = (index: number, field: keyof ChemistryItem, value: string) => {
    const updated = [...pricing.chemistry];
    updated[index] = { ...updated[index], [field]: value };
    setPricing({ ...pricing, chemistry: updated });
  };

  const updateAdditionalField = (index: number, field: keyof AdditionalItem, value: string) => {
    const updated = [...pricing.additional];
    updated[index] = { ...updated[index], [field]: value };
    setPricing({ ...pricing, additional: updated });
  };

  const hasData = Object.values(pricing).some(arr => arr.length > 0);

  const categoryTitles = {
    cleaning: 'Прибирання',
    windows: 'Миття вікон',
    chemistry: 'Хімчистка',
    additional: 'Додаткові послуги',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderCleaningItem = (item: CleaningItem, index: number) => {
    const isEditing = editingItem?.category === 'cleaning' && editingItem?.index === index;

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Площа приміщення</Label>
            <Input
              value={item.area}
              onChange={(e) => updateCleaningField(index, 'area', e.target.value)}
              placeholder="до 50 м²"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div key="afterRepair">
              <Label className="text-xs">Після ремонту</Label>
              <Input
                value={item.afterRepair}
                onChange={(e) => updateCleaningField(index, 'afterRepair', e.target.value)}
                placeholder="2000 грн"
              />
            </div>
            <div key="general">
              <Label className="text-xs">Генеральне</Label>
              <Input
                value={item.general}
                onChange={(e) => updateCleaningField(index, 'general', e.target.value)}
                placeholder="1500 грн"
              />
            </div>
            <div key="supporting">
              <Label className="text-xs">Підтримуюче</Label>
              <Input
                value={item.supporting}
                onChange={(e) => updateCleaningField(index, 'supporting', e.target.value)}
                placeholder="1000 грн"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleUpdateItem('cleaning', index)} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              Зберегти
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4 mr-1" />
              Скасувати
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="font-medium text-foreground">{item.area}</p>
          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
            <div key="afterRepair">
              <span className="text-xs">Після ремонту:</span>
              <p className="text-foreground font-medium">{item.afterRepair}</p>
            </div>
            <div key="general">
              <span className="text-xs">Генеральне:</span>
              <p className="text-foreground font-medium">{item.general}</p>
            </div>
            <div key="supporting">
              <span className="text-xs">Підтримуюче:</span>
              <p className="text-foreground font-medium">{item.supporting}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingItem({ category: 'cleaning', index })}
            className="hover:bg-primary/10 hover:border-primary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteItem('cleaning', index)}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderWindowItem = (item: WindowItem, index: number) => {
    const isEditing = editingItem?.category === 'windows' && editingItem?.index === index;

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Тип забруднення</Label>
            <Input
              value={item.type}
              onChange={(e) => updateWindowField(index, 'type', e.target.value)}
              placeholder="Легке забруднення"
            />
          </div>
          <div>
            <Label className="text-xs">Ціна</Label>
            <Input
              value={item.price}
              onChange={(e) => updateWindowField(index, 'price', e.target.value)}
              placeholder="від 50 грн/м²"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleUpdateItem('windows', index)} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              Зберегти
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4 mr-1" />
              Скасувати
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.type}</p>
          <p className="text-sm text-primary font-semibold mt-1">{item.price}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingItem({ category: 'windows', index })}
            className="hover:bg-primary/10 hover:border-primary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteItem('windows', index)}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderChemistryItem = (item: ChemistryItem, index: number) => {
    const isEditing = editingItem?.category === 'chemistry' && editingItem?.index === index;

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Назва послуги</Label>
            <Input
              value={item.item}
              onChange={(e) => updateChemistryField(index, 'item', e.target.value)}
              placeholder="Диван 2-місний"
            />
          </div>
          <div>
            <Label className="text-xs">Ціна</Label>
            <Input
              value={item.price}
              onChange={(e) => updateChemistryField(index, 'price', e.target.value)}
              placeholder="від 800 грн"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleUpdateItem('chemistry', index)} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              Зберегти
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4 mr-1" />
              Скасувати
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.item}</p>
          <p className="text-sm text-primary font-semibold mt-1">{item.price}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingItem({ category: 'chemistry', index })}
            className="hover:bg-primary/10 hover:border-primary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteItem('chemistry', index)}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAdditionalItem = (item: AdditionalItem, index: number) => {
    const isEditing = editingItem?.category === 'additional' && editingItem?.index === index;

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Назва послуги</Label>
            <Input
              value={item.service}
              onChange={(e) => updateAdditionalField(index, 'service', e.target.value)}
              placeholder="Миття холодильника"
            />
          </div>
          <div>
            <Label className="text-xs">Ціна</Label>
            <Input
              value={item.price}
              onChange={(e) => updateAdditionalField(index, 'price', e.target.value)}
              placeholder="200 грн"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleUpdateItem('additional', index)} disabled={saving}>
              <Save className="w-4 h-4 mr-1" />
              Зберегти
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4 mr-1" />
              Скасувати
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.service}</p>
          <p className="text-sm text-primary font-semibold mt-1">{item.price}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingItem({ category: 'additional', index })}
            className="hover:bg-primary/10 hover:border-primary"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteItem('additional', index)}
            disabled={saving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управління цінами</CardTitle>
              <CardDescription>
                {hasData ? 'Редагуйте послуги та ціни' : 'Завантажте початкові дані для початку'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!hasData && (
                <Button
                  onClick={handleInitialize}
                  disabled={initializing}
                  className="neon-glow"
                >
                  {initializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Завантажити початкові дані
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <Accordion type="single" collapsible className="w-full">
              {/* Cleaning Category */}
              <AccordionItem value="cleaning">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">{categoryTitles.cleaning}</span>
                    <Badge variant="secondary" className="ml-auto mr-2 bg-primary/10 text-primary">
                      {pricing.cleaning.length} {pricing.cleaning.length === 1 ? 'послуга' : 'послуг'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    {pricing.cleaning.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-card/50 border border-border rounded-lg space-y-3 hover:border-primary/30 transition-colors"
                      >
                        {renderCleaningItem(item, index)}
                      </div>
                    ))}

                    <Dialog open={dialogOpen && newItemCategory === 'cleaning'} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setNewItemCategory('cleaning');
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNewItemCategory('cleaning');
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Додати ціну
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                        <DialogHeader>
                          <DialogTitle>Нова ціна - {categoryTitles.cleaning}</DialogTitle>
                          <DialogDescription>
                            Додайте нову ціну для прибирання
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="area">Площа приміщення *</Label>
                            <Input
                              id="area"
                              value={cleaningForm.area}
                              onChange={(e) => setCleaningForm({ ...cleaningForm, area: e.target.value })}
                              placeholder="до 50 м²"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="afterRepair">Після ремонту *</Label>
                            <Input
                              id="afterRepair"
                              value={cleaningForm.afterRepair}
                              onChange={(e) => setCleaningForm({ ...cleaningForm, afterRepair: e.target.value })}
                              placeholder="2000 грн"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="general">Генеральне прибирання *</Label>
                            <Input
                              id="general"
                              value={cleaningForm.general}
                              onChange={(e) => setCleaningForm({ ...cleaningForm, general: e.target.value })}
                              placeholder="1500 грн"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supporting">Підтримуюче прибирання *</Label>
                            <Input
                              id="supporting"
                              value={cleaningForm.supporting}
                              onChange={(e) => setCleaningForm({ ...cleaningForm, supporting: e.target.value })}
                              placeholder="1000 грн"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={saving} className="w-full">
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Додавання...
                              </>
                            ) : (
                              'Додати ціну'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Windows Category */}
              <AccordionItem value="windows">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">{categoryTitles.windows}</span>
                    <Badge variant="secondary" className="ml-auto mr-2 bg-primary/10 text-primary">
                      {pricing.windows.length} {pricing.windows.length === 1 ? 'послуга' : 'послуг'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    {pricing.windows.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-card/50 border border-border rounded-lg space-y-3 hover:border-primary/30 transition-colors"
                      >
                        {renderWindowItem(item, index)}
                      </div>
                    ))}

                    <Dialog open={dialogOpen && newItemCategory === 'windows'} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setNewItemCategory('windows');
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNewItemCategory('windows');
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Додати ціну
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                        <DialogHeader>
                          <DialogTitle>Нова ціна - {categoryTitles.windows}</DialogTitle>
                          <DialogDescription>
                            Додайте нову ціну для миття вікон
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="type">Тип забруднення *</Label>
                            <Input
                              id="type"
                              value={windowForm.type}
                              onChange={(e) => setWindowForm({ ...windowForm, type: e.target.value })}
                              placeholder="Легке забруднення"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Ціна *</Label>
                            <Input
                              id="price"
                              value={windowForm.price}
                              onChange={(e) => setWindowForm({ ...windowForm, price: e.target.value })}
                              placeholder="від 50 грн/м²"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={saving} className="w-full">
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Додавання...
                              </>
                            ) : (
                              'Додати ціну'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Chemistry Category */}
              <AccordionItem value="chemistry">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">{categoryTitles.chemistry}</span>
                    <Badge variant="secondary" className="ml-auto mr-2 bg-primary/10 text-primary">
                      {pricing.chemistry.length} {pricing.chemistry.length === 1 ? 'послуга' : 'послуг'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    {pricing.chemistry.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-card/50 border border-border rounded-lg space-y-3 hover:border-primary/30 transition-colors"
                      >
                        {renderChemistryItem(item, index)}
                      </div>
                    ))}

                    <Dialog open={dialogOpen && newItemCategory === 'chemistry'} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setNewItemCategory('chemistry');
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNewItemCategory('chemistry');
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Додати послугу
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                        <DialogHeader>
                          <DialogTitle>Нова послуга - {categoryTitles.chemistry}</DialogTitle>
                          <DialogDescription>
                            Додайте нову послугу хімчистки
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="item">Назва послуги *</Label>
                            <Input
                              id="item"
                              value={chemistryForm.item}
                              onChange={(e) => setChemistryForm({ ...chemistryForm, item: e.target.value })}
                              placeholder="Диван 2-місний"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Ціна *</Label>
                            <Input
                              id="price"
                              value={chemistryForm.price}
                              onChange={(e) => setChemistryForm({ ...chemistryForm, price: e.target.value })}
                              placeholder="від 800 грн"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={saving} className="w-full">
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Додавання...
                              </>
                            ) : (
                              'Додати послугу'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Additional Category */}
              <AccordionItem value="additional">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">{categoryTitles.additional}</span>
                    <Badge variant="secondary" className="ml-auto mr-2 bg-primary/10 text-primary">
                      {pricing.additional.length} {pricing.additional.length === 1 ? 'послуга' : 'послуг'}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-4">
                    {pricing.additional.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-card/50 border border-border rounded-lg space-y-3 hover:border-primary/30 transition-colors"
                      >
                        {renderAdditionalItem(item, index)}
                      </div>
                    ))}

                    <Dialog open={dialogOpen && newItemCategory === 'additional'} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setNewItemCategory('additional');
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setNewItemCategory('additional');
                            setDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Додати послугу
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                        <DialogHeader>
                          <DialogTitle>Нова послуга - {categoryTitles.additional}</DialogTitle>
                          <DialogDescription>
                            Додайте нову додаткову послугу
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddItem} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="service">Назва послуги *</Label>
                            <Input
                              id="service"
                              value={additionalForm.service}
                              onChange={(e) => setAdditionalForm({ ...additionalForm, service: e.target.value })}
                              placeholder="Миття холодильника"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Ціна *</Label>
                            <Input
                              id="price"
                              value={additionalForm.price}
                              onChange={(e) => setAdditionalForm({ ...additionalForm, price: e.target.value })}
                              placeholder="200 грн"
                              required
                            />
                          </div>
                          <Button type="submit" disabled={saving} className="w-full">
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Додавання...
                              </>
                            ) : (
                              'Додати послугу'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Натисніть кнопку вище щоб завантажити початкові ціни з прикладу
              </p>
              <p className="text-sm text-muted-foreground">
                Після завантаження ви зможете редагувати кожну позицію
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {hasData && (
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>💡 <strong>Підказка:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Кожна категорія може містити необмежену кількість позицій</li>
                <li>Ціни відображаються на сторінці "Ціни" для всіх відвідувачів</li>
                <li>Використовуйте кнопку "Редагувати" для зміни даних</li>
                <li>Всі зміни зберігаються негайно</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

PricingManager.displayName = 'PricingManager';
