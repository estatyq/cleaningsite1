import { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Star, Trash2, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  approved: boolean;
  createdAt: string;
}

interface ReviewsManagerProps {
  password: string;
}

const REVIEWS_PER_PAGE = 6;

export const ReviewsManager = memo(({ password }: ReviewsManagerProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/reviews/all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load reviews');
      }

      const data = await response.json();
      setReviews(data.data.sort((a: Review, b: Review) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Помилка завантаження відгуків');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/reviews/${id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
          body: JSON.stringify({ approved: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      await loadReviews();
      toast.success(currentStatus ? 'Відгук приховано' : 'Відгук схвалено!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Помилка оновлення відгуку');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    setActionLoading(reviewToDelete);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4e0b1fee/reviews/${reviewToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Admin-Password': password,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      await loadReviews();
      toast.success('Відгук видалено!');
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Помилка видалення відгуку');
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Pagination
  const totalPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const approvedCount = reviews.filter(r => r.approved).length;
  const pendingCount = reviews.filter(r => !r.approved).length;

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
          <CardTitle>Управління відгуками</CardTitle>
          <CardDescription className="flex items-center justify-between gap-2">
            <span>Модеруйте відгуки клієнтів, схвалюйте або видаляйте їх</span>
            <a 
              href="#media-guide" 
              onClick={(e) => {
                e.preventDefault();
                const url = new URL(window.location.href);
                url.hash = '';
                window.history.pushState({}, '', url);
                const tabTrigger = document.querySelector('[value="media-guide"]');
                if (tabTrigger instanceof HTMLElement) {
                  tabTrigger.click();
                }
              }}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 flex-shrink-0"
            >
              📚 Як завантажувати фото
            </a>
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <Badge variant="outline" className="bg-green-500/10 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Схвалено: {approvedCount}
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              На модерації: {pendingCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Відгуків поки немає</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {currentReviews.map((review) => (
                  <Card
                    key={review.id}
                    className={`bg-card/50 border-2 transition-all ${
                      review.approved
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-yellow-500/30 bg-yellow-500/5'
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="ring-2 ring-accent/30">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                              {getInitials(review.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('uk-UA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={review.approved ? 'default' : 'secondary'}>
                          {review.approved ? 'Опубліковано' : 'Модерація'}
                        </Badge>
                      </div>

                      <div className="flex gap-1 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>

                      {review.image && review.image.trim() !== '' && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={review.image}
                            alt={`Відгук від ${review.name}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {review.text}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={review.approved ? 'outline' : 'default'}
                          onClick={() => handleApprove(review.id, review.approved)}
                          disabled={actionLoading === review.id}
                          className="flex-1"
                        >
                          {actionLoading === review.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : review.approved ? (
                            <XCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          {review.approved ? 'Приховати' : 'Схвалити'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setReviewToDelete(review.id);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={actionLoading === review.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    ))}
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
                Сторінка {currentPage} з {totalPages} • Всього відгуків: {reviews.length}
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
              <li>Схвалені відгуки відображаються на сайті для всіх відвідувачів</li>
              <li>Відгуки на модерації бачите тільки ви в адмін панелі</li>
              <li>Ви можете приховати схвалений відгук, натиснувши "Приховати"</li>
              <li>Видалення відгуку є незворотною операцією</li>
              <li>Новіші відгуки показуються першими</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити відгук?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія незворотня. Відгук буде видалено назавжди і не зможе бути відновлений.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
              Скасувати
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading === reviewToDelete ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Видалення...
                </>
              ) : (
                'Видалити'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

ReviewsManager.displayName = 'ReviewsManager';
