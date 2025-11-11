/**
 * Video platform detection and helpers
 */

export interface VideoInfo {
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'other';
  embedUrl: string;
  thumbnailUrl: string | null;
  isEmbeddable: boolean;
}

/**
 * Get YouTube video ID from various URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^&\?\/]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Get Vimeo video ID from URL
 */
function getVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Get TikTok video ID from URL
 */
function getTikTokVideoId(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Get Instagram video/post ID from URL
 */
function getInstagramPostId(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
    /instagram\.com\/tv\/([A-Za-z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Get video information from URL
 */
export function getVideoInfo(url: string): VideoInfo {
  const lowerUrl = url.toLowerCase();
  
  // YouTube
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return {
        platform: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        isEmbeddable: true,
      };
    }
  }
  
  // Vimeo
  if (lowerUrl.includes('vimeo.com')) {
    const videoId = getVimeoVideoId(url);
    if (videoId) {
      return {
        platform: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        thumbnailUrl: null, // Vimeo thumbnails require API call
        isEmbeddable: true,
      };
    }
  }
  
  // TikTok
  if (lowerUrl.includes('tiktok.com')) {
    const videoId = getTikTokVideoId(url);
    if (videoId) {
      return {
        platform: 'tiktok',
        embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
        thumbnailUrl: null, // TikTok doesn't provide easy thumbnail access
        isEmbeddable: true,
      };
    }
  }
  
  // Instagram
  if (lowerUrl.includes('instagram.com')) {
    const postId = getInstagramPostId(url);
    if (postId) {
      return {
        platform: 'instagram',
        embedUrl: `https://www.instagram.com/p/${postId}/embed`,
        thumbnailUrl: null, // Instagram thumbnails require API
        isEmbeddable: true,
      };
    }
  }
  
  // Other / direct video file
  return {
    platform: 'other',
    embedUrl: url,
    thumbnailUrl: null,
    isEmbeddable: false,
  };
}

/**
 * Check if URL is a video platform URL
 */
export function isVideoPlatformUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be') ||
    lowerUrl.includes('vimeo.com') ||
    lowerUrl.includes('tiktok.com') ||
    lowerUrl.includes('instagram.com')
  );
}

/**
 * Check if URL is a direct video file
 */
export function isDirectVideoFile(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.ogg') ||
    lowerUrl.endsWith('.mov')
  );
}
