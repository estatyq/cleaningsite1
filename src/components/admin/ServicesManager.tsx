import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getServices, saveService, deleteService } from '../../utils/api';
import { handleApiError } from '../../utils/errorHandler';

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export const ServicesManager = memo(({ password }: { password: string }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: [''],
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data.sort((a: Service, b: Service) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      // Check if it's an unauthorized error
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        toast.error(error.message);
        window.dispatchEvent(new Event('unauthorized'));
      } else {
        toast.error('Помилка завантаження послуг');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      const { initializeServices } = await import('../../utils/initializeData');
      await initializeServices(password);
      await loadServices();
      toast.success('Початкові послуги завантажено!');
    } catch (error) {
      toast.error('Помилка ініціалізації');
    } finally {
      setInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty features
    const features = formData.features.filter(f => f.trim() !== '');
    
    if (features.length === 0) {
      toast.error('Додайте хоча б один параметр');
      return;
    }

    try {
      await saveService(password, {
        ...formData,
        features,
        id: editingService?.id,
      });
      await loadServices();
      setDialogOpen(false);
      setEditingService(null);
      setFormData({ title: '', description: '', features: [''] });
      toast.success('Послугу збережено!');
    } catch (error) {
      if (error instanceof Error && error.name === 'UnauthorizedError') {
        toast.error(error.message);
        window.dispatchEvent(new Event('unauthorized'));
      } else {
        toast.error('Помилка збереження');
      }
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      features: service.features.length > 0 ? service.features : [''],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цю послугу?')) return;
    
    try {
      await deleteService(password, id);
      await loadServices();
      toast.success('Послугу видалено!');
    } catch (error) {
      toast.error('Помилка видалення');
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ''],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : [''],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures,
    });
  };

  if (loading) {
    return <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Наші послуги ({services.length})</CardTitle>
              <CardDescription>Керування послугами на головній сторінці</CardDescription>
            </div>
            <div className="flex gap-2">
              {services.length === 0 && (
                <Button 
                  onClick={handleInitialize} 
                  disabled={initializing}
                  variant="outline"
                >
                  {initializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Завантаження...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Завантажити приклади
                    </>
                  )}
                </Button>
              )}
              <Button onClick={() => { setEditingService(null); setFormData({ title: '', description: '', features: [''] }); setDialogOpen(true); }} className="neon-glow">
                <Plus className="w-4 h-4 mr-2" />
                Додати послугу
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="p-4 border border-border rounded-lg hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Немає послуг. Додайте першу!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Редагувати послугу' : 'Нова послуга'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Змініть дані послуги нижче' : 'Заповніть дані для нової послуги'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Прибирання квартир"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Опис *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Комплексне прибирання вашої квартири з використанням професійного обладнання"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Параметри послуги *</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" />
                  Додати параметр
                </Button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Вологе прибирання"
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingService ? 'Оновити' : 'Створити'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Скасувати
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ServicesManager.displayName = 'ServicesManager';
