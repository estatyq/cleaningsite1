import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Plus, Trash2, Edit, Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  published: boolean;
  createdAt: string;
}

interface BlogManagerProps {
  password: string;
}

const POSTS_PER_PAGE = 6;

export const BlogManager = memo(({ password }: BlogManagerProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    video: '',
    published: true,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/blog/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load posts');
      }

      const data = await response.json();
      setPosts(data.data.sort((a: BlogPost, b: BlogPost) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Помилка завантаження постів');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingPost
        ? `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/blog/${editingPost.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/blog`;

      const response = await fetch(url, {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          image: formData.image || undefined,
          video: formData.video || undefined,
          published: formData.published,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      await loadPosts();
      toast.success(editingPost ? 'Пост оновлено!' : 'Пост створено!');
      setDialogOpen(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', image: '', videoUrl: '', published: true });
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || '',
      video: post.video || '',
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/blog/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      await loadPosts();
      toast.success('Пост видалено!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Помилка видалення');
    } finally {
      setSaving(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

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
              <CardTitle>Управління блогом</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Створюйте та редагуйте пости блогу</span>
                <a 
                  href="#media-guide" 
                  onClick={(e) => {
                    e.preventDefault();
                    const tabTrigger = document.querySelector('[value="media-guide"]');
                    if (tabTrigger instanceof HTMLElement) {
                      tabTrigger.click();
                    }
                  }}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  📚 Інструкція
                </a>
              </CardDescription>
              <div className="flex gap-4 mt-4">
                <Badge variant="outline" className="bg-green-500/10 border-green-500/30">
                  Опубліковано: {publishedCount}
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                  Чернеток: {draftCount}
                </Badge>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditingPost(null);
                setFormData({ title: '', content: '', image: '', video: '', published: true });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="neon-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Новий пост
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border">
                <DialogHeader>
                  <DialogTitle>
                    {editingPost ? 'Редагувати пост' : 'Новий пост'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPost ? 'Оновіть інформацію про пост блогу' : 'Створіть новий пост для блогу'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Заголовок *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Заголовок поста..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Контент *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Текст поста..."
                      rows={10}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Посилання на зображення</Label>
                    <Input
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg (необов'язково)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video">Посилання на відео</Label>
                    <Input
                      id="video"
                      type="url"
                      value={formData.video}
                      onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                      placeholder="https://... (необов'язково)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Підтримується: YouTube, TikTok, Instagram, Vimeo або пряме посилання на відео файл
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Опублікувати одразу
                    </Label>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingPost ? 'Оновлення...' : 'Створення...'}
                      </>
                    ) : (
                      editingPost ? 'Оновити пост' : 'Створити пост'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Постів ще немає. Створіть перший пост!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-border rounded-lg space-y-2 bg-card/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{post.title}</p>
                          <Badge variant={post.published ? 'default' : 'secondary'}>
                            {post.published ? 'Опубліковано' : 'Чернетка'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Редагувати
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post.id)}
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
                Сторінка {currentPage} з {totalPages} • Всього постів: {posts.length}
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
              <li>Опубліковані пости відображаються на сторінці "Блог"</li>
              <li>Чернетки бачите тільки ви в адмін панелі</li>
              <li>Додайте зображення або YouTube відео для кращого контенту</li>
              <li>Нові пости з'являються першими</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BlogManager.displayName = 'BlogManager';
