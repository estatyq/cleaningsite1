import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Trash2, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../ui/dialog';

interface GalleryItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  description?: string;
  createdAt: string;
}

interface GalleryManagerProps {
  password: string;
}

const ITEMS_PER_PAGE = 12;

export const GalleryManager = memo(({ password }: GalleryManagerProps) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    url: '',
    type: 'photo' as 'photo' | 'video',
    description: '',
  });

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/gallery`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load gallery');
      }

      const data = await response.json();
      setItems(data.data.sort((a: GalleryItem, b: GalleryItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Помилка завантаження галереї');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    if (!formData.url.trim()) {
      toast.error('Введіть URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error('Невірний формат URL. Введіть повний URL (з http:// або https://)');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/gallery`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
          body: JSON.stringify({
            url: formData.url.trim(),
            type: formData.type,
            description: formData.description || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add item');
      }

      await loadGallery();
      toast.success('Додано до галереї!');
      setDialogOpen(false);
      setFormData({ url: '', type: 'photo', description: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error(error instanceof Error ? error.message : 'Помилка додавання');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/gallery/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await loadGallery();
      toast.success('Видалено!');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Помилка видалення');
    } finally {
      setSaving(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/30 backdrop-blur-xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Галерея робіт</CardTitle>
              <CardDescription>
                Додавайте фото та відео ваших робіт
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Додати
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
                <DialogHeader>
                  <DialogTitle>Додати до галереї</DialogTitle>
                  <DialogDescription>
                    Вставте посилання на фото або відео (YouTube, TikTok, Instagram, Vimeo)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Тип *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'photo' | 'video') => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Фото</SelectItem>
                        <SelectItem value="video">Відео</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">
                      {formData.type === 'photo' ? 'Посилання на фото *' : 'Посилання на відео *'}
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder={
                        formData.type === 'photo' 
                          ? 'https://example.com/photo.jpg' 
                          : 'https://www.youtube.com/watch?v=... або інша платформа'
                      }
                      required
                    />
                    {formData.type === 'video' && (
                      <p className="text-xs text-muted-foreground">
                        Підтримується: YouTube, TikTok, Instagram, Vimeo або пряме посилання на відео файл
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Опис (необов'язково)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Короткий опис роботи"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Додавання...
                      </>
                    ) : (
                      'Додати'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Галерея порожня. Додайте перше фото або відео!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group border border-border rounded-lg overflow-hidden bg-card/50"
                  >
                    {item.type === 'photo' ? (
                      <ImageWithFallback
                        src={item.url}
                        alt={item.description || 'Gallery item'}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-primary" />
                          <p className="text-xs text-muted-foreground">YouTube Video</p>
                        </div>
                      </div>
                    )}
                    
                    {item.description && (
                      <div className="p-2 bg-card/80 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Видалити
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Попередня
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Наступна
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Сторінка {currentPage} з {totalPages} • Всього елементів: {items.length}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>💡 <strong>Підказка:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Підтримуються фото (JPG, PNG) та YouTube відео</li>
              <li>Для YouTube вставте повне посилання на відео</li>
              <li>Опис допоможе відвідувачам краще зрозуміти роботу</li>
              <li>Нові елементи з'являються на сторінці "Галерея"</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

GalleryManager.displayName = 'GalleryManager';
