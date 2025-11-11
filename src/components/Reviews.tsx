import { Star, Quote, MessageSquarePlus, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { motion } from 'motion/react';
import { memo, useState, useCallback, useEffect } from 'react';
import { GradientText } from './GradientText';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { submitReview, getReviews } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  approved: boolean;
  createdAt: string;
}

const gradients = [
  'from-primary to-primary/50',
  'from-secondary to-secondary/50',
  'from-accent to-accent/50',
  'from-primary to-cyan-500/50',
  'from-secondary to-purple-500/50',
  'from-accent to-pink-500/50',
];

const ReviewCard = memo(
  ({
    review,
    index,
    prefersReducedMotion,
    gradient,
  }: {
    review: Review;
    index: number;
    prefersReducedMotion: boolean;
    gradient: string;
  }) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={prefersReducedMotion ? {} : { scale: 1.03, y: -8 }}
      >
        <Card className="h-full bg-card/30 backdrop-blur-xl border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 group overflow-hidden relative">
          {/* Quote icon background */}
          <Quote className="absolute top-4 right-4 w-16 h-16 text-accent/10 group-hover:text-accent/20 transition-colors" />

          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-500" />

          <CardContent className="pt-6 relative z-10">
            {review.image && review.image.trim() !== '' && (
              <div className="mb-4 -mt-6 -mx-6 h-48 overflow-hidden">
                <ImageWithFallback
                  src={review.image}
                  alt={`Відгук від ${review.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="ring-2 ring-accent/30 group-hover:ring-accent transition-all">
                <AvatarFallback
                  className={`bg-gradient-to-br ${gradient} text-white`}
                >
                  {getInitials(review.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-foreground group-hover:text-primary transition-colors">
                  {review.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
            </div>

            <div className="flex gap-1 mb-4">
              {[...Array(review.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>

            <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors leading-relaxed">
              {review.text}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

ReviewCard.displayName = 'ReviewCard';

export const Reviews = memo(({ onNavigate }: { onNavigate?: (page: string) => void }) => {
  const prefersReducedMotion = useReducedMotion();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5,
    image: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await getReviews();
      // Фільтруємо лише затверджені відгуки та сортуємо за датою (останні першими)
      const approvedReviews = response.data
        .filter((review: Review) => review.approved)
        .sort((a: Review, b: Review) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6); // Беремо лише останні 6
      setReviews(approvedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitReview({
        name: formData.name,
        text: formData.text,
        rating: formData.rating,
        image: formData.image || undefined,
      });

      toast.success('Дякуємо за ваш відгук! Він з\'явиться після модерації.');
      setFormData({ name: '', text: '', rating: 5, image: '' });
      setDialogOpen(false);
    } catch (error) {
      toast.error('Помилка при відправці відгуку');
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData]);

  return (
    <section
      id="reviews"
      className="py-16 md:py-24 bg-muted/30 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-foreground mb-4 text-4xl md:text-5xl">
            Відгуки <GradientText animate={!prefersReducedMotion}>наших клієнтів</GradientText>
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
          >
            Нам довіряють тисячі клієнтів по всій Україні
          </motion.p>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="neon-glow">
                <MessageSquarePlus className="w-5 h-5 mr-2" />
                Залишити відгук
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border">
              <DialogHeader>
                <DialogTitle>Новий відгук</DialogTitle>
                <DialogDescription>
                  Поділіться своїм досвідом роботи з нашою компанією
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ім'я *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ваше ім'я"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Оцінка *</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= formData.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Відгук *</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Розкажіть про ваш досвід..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Посилання на фото (необов'язково)</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://i.imgur.com/example.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Вкажіть пряме посилання на зображення (має закінчуватись на .jpg, .png тощо)
                  </p>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Відправка...
                    </>
                  ) : (
                    'Відправити відгук'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={index}
                  prefersReducedMotion={prefersReducedMotion}
                  gradient={gradients[index % gradients.length]}
                />
              ))}
            </div>
            
            {/* Кнопка "Показати ще" */}
            {onNavigate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-center mt-12"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate('reviews')}
                  className="border-primary/30 hover:bg-primary/10 backdrop-blur-sm group"
                >
                  <span className="flex items-center gap-2">
                    Показати всі відгуки
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Поки що немає відгуків. Будьте першим!
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

Reviews.displayName = 'Reviews';
