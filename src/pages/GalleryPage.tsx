import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { GradientText } from '../components/GradientText';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getGallery } from '../utils/api';
import { Loader2, Image as ImageIcon, Video } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription } from '../components/ui/dialog';
import { getVideoInfo, isDirectVideoFile } from '../utils/videoHelpers';

interface GalleryItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  description: string;
  createdAt: string;
}

export const GalleryPage = memo(() => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const response = await getGallery();
      setItems(response.data.sort((a: GalleryItem, b: GalleryItem) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const photos = items.filter(item => item.type === 'photo');
  const videos = items.filter(item => item.type === 'video');

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
            <GradientText>Наша робота</GradientText>
          </h1>
          <p className="text-xl text-muted-foreground">
            Фото та відео звітність наших проектів
          </p>
        </motion.div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="all">
              Всі ({items.length})
            </TabsTrigger>
            <TabsTrigger value="photos">
              <ImageIcon className="w-4 h-4 mr-2" />
              Фото ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="w-4 h-4 mr-2" />
              Відео ({videos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <GalleryGrid items={items} onItemClick={setSelectedItem} />
          </TabsContent>

          <TabsContent value="photos">
            <GalleryGrid items={photos} onItemClick={setSelectedItem} />
          </TabsContent>

          <TabsContent value="videos">
            <GalleryGrid items={videos} onItemClick={setSelectedItem} />
          </TabsContent>
        </Tabs>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Поки що немає матеріалів в галереї
            </p>
          </div>
        )}
      </div>

      {/* Full screen preview dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-border">
          <DialogDescription className="sr-only">
            Перегляд елементу галереї
          </DialogDescription>
          {selectedItem && (
            <div className="space-y-4">
              {selectedItem.type === 'photo' ? (
                <ImageWithFallback
                  src={selectedItem.url}
                  alt={selectedItem.description}
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="aspect-video w-full">
                  {(() => {
                    const videoInfo = getVideoInfo(selectedItem.url);
                    
                    if (videoInfo.isEmbeddable) {
                      return (
                        <iframe
                          src={videoInfo.embedUrl}
                          className="w-full h-full rounded-lg border-0"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          title={selectedItem.description}
                        />
                      );
                    } else if (isDirectVideoFile(selectedItem.url)) {
                      return (
                        <video
                          src={selectedItem.url}
                          controls
                          className="w-full h-full rounded-lg"
                        />
                      );
                    } else {
                      // Fallback for other URLs - try as direct link
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-lg">
                          <a 
                            href={selectedItem.url} 
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
              {selectedItem.description && (
                <p className="text-muted-foreground">{selectedItem.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

const GalleryGrid = memo(({ items, onItemClick }: { items: GalleryItem[]; onItemClick: (item: GalleryItem) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => onItemClick(item)}
          className="relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 border-border hover:border-primary transition-all shadow-lg hover:shadow-xl hover:shadow-primary/20 group"
        >
          {item.type === 'photo' ? (
            <ImageWithFallback
              src={item.url}
              alt={item.description}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full bg-black">
              {(() => {
                const videoInfo = getVideoInfo(item.url);
                
                if (videoInfo.thumbnailUrl) {
                  // Show thumbnail if available (YouTube, etc.)
                  return (
                    <ImageWithFallback
                      src={videoInfo.thumbnailUrl}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  );
                } else if (isDirectVideoFile(item.url)) {
                  // Show video preview for direct files
                  return (
                    <video
                      src={item.url}
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  // Show generic video placeholder
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
          
          {/* Overlay with description */}
          {item.description && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm">{item.description}</p>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
});

GalleryGrid.displayName = 'GalleryGrid';
GalleryPage.displayName = 'GalleryPage';
