import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GradientText } from '../components/GradientText';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getBlogPosts } from '../utils/api';
import { Loader2, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { getVideoInfo, isDirectVideoFile } from '../utils/videoHelpers';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  video?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BlogPage = memo(() => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await getBlogPosts();
      setPosts(response.data.sort((a: BlogPost, b: BlogPost) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-4">
            <GradientText>Блог</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Корисні поради та новини від наших експертів
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -8 }}
            >
              <Card
                className="h-full bg-card/30 backdrop-blur-xl border-border hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => setSelectedPost(post)}
              >
                {(post.image || post.video) && (
                  <div className="relative h-48 overflow-hidden">
                    {post.image && post.image.trim() !== '' && !post.video && (
                      <ImageWithFallback
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    {post.video && (
                      <div className="relative w-full h-full bg-black">
                        {(() => {
                          const videoInfo = getVideoInfo(post.video);
                          
                          if (videoInfo.thumbnailUrl) {
                            return (
                              <ImageWithFallback
                                src={videoInfo.thumbnailUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            );
                          } else if (isDirectVideoFile(post.video)) {
                            return (
                              <video
                                src={post.video}
                                preload="metadata"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            );
                          } else {
                            return (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                                <div className="text-center space-y-2">
                                  <div className="text-4xl">🎬</div>
                                  <p className="text-xs text-muted-foreground">
                                    {videoInfo.platform === 'tiktok' ? 'TikTok' : 
                                     videoInfo.platform === 'instagram' ? 'Instagram' :
                                     videoInfo.platform === 'vimeo' ? 'Vimeo' : 'Відео'}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(post.createdAt).toLocaleDateString('uk-UA')}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Поки що немає публікацій в блозі
            </p>
          </div>
        )}
      </div>

      {/* Full post dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                <DialogDescription>
                  {new Date(selectedPost.createdAt).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedPost.image && selectedPost.image.trim() !== '' && !selectedPost.video && (
                  <ImageWithFallback
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-auto rounded-lg"
                  />
                )}

                {selectedPost.video && (
                  <div className="aspect-video w-full">
                    {(() => {
                      const videoInfo = getVideoInfo(selectedPost.video);
                      
                      if (videoInfo.isEmbeddable) {
                        return (
                          <iframe
                            src={videoInfo.embedUrl}
                            className="w-full h-full rounded-lg border-0"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title={selectedPost.title}
                          />
                        );
                      } else if (isDirectVideoFile(selectedPost.video)) {
                        return (
                          <video
                            src={selectedPost.video}
                            controls
                            className="w-full h-auto rounded-lg"
                          />
                        );
                      } else {
                        return (
                          <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                            <a 
                              href={selectedPost.video} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Відкрити відео
                            </a>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

BlogPage.displayName = 'BlogPage';
