import { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Video, RefreshCw, Youtube, Radio } from 'lucide-react';
import './App.css';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

interface PodcastItem {
  id: string;
  name: string;
  description: string;
  image: string;
  releaseDate: string;
  duration: number;
  externalUrl: string;
}

function App() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'podcasts'>('videos');
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videosRes, podcastsRes] = await Promise.all([
        fetch(`${API_URL}/api/videos`),
        fetch(`${API_URL}/api/podcasts`),
      ]);

      if (!videosRes.ok || !podcastsRes.ok) {
        throw new Error('Failed to fetch content');
      }

      const videosData = await videosRes.json();
      const podcastsData = await podcastsRes.json();

      setVideos(videosData.videos || videosData);
      setNextPageToken(videosData.nextPageToken || null);
      setHasMore(!!videosData.nextPageToken);
      setPodcasts(podcastsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreVideos = useCallback(async () => {
    if (!nextPageToken || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const response = await fetch(`${API_URL}/api/videos?pageToken=${nextPageToken}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch more videos');
      }

      const data = await response.json();
      setVideos(prev => [...prev, ...(data.videos || [])]);
      setNextPageToken(data.nextPageToken || null);
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error('Error loading more videos:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPageToken, loadingMore, hasMore, API_URL]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetch(`${API_URL}/api/refresh`);
      await fetchContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== 'videos') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [activeTab, hasMore, loadingMore, loadMoreVideos]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLAnchorElement>, videoId: string) => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS || isAndroid) {
      e.preventDefault();
      
      const appUrl = isIOS 
        ? `youtube://watch?v=${videoId}`
        : `vnd.youtube://${videoId}`;
      
      const webUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      window.location.href = appUrl;
      
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.open(webUrl, '_blank');
        }
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="relative z-10">
        <header className="border-b border-purple-500/30 backdrop-blur-sm bg-black/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-10 h-10 text-purple-400" />
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                    The Rock Lore Vault
                  </h1>
                  <p className="text-sm text-gray-400 mt-1">Your Ultimate Rock Archive</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'videos'
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/50'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Youtube className="w-5 h-5" />
              YouTube Videos
            </button>
            <button
              onClick={() => setActiveTab('podcasts')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'podcasts'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/50'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <Radio className="w-5 h-5" />
              Podcasts
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading content...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8">
              <p className="text-red-300">Error: {error}</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure the backend server is running and API keys are configured.
              </p>
            </div>
          )}

          {!loading && !error && activeTab === 'videos' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleVideoClick(e, video.id)}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Video className="w-12 h-12 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{video.channelTitle}</span>
                        <span>{formatDate(video.publishedAt)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              
              {hasMore && (
                <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                  {loadingMore && (
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Loading more videos...</p>
                    </div>
                  )}
                </div>
              )}
              
              {!hasMore && videos.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">You've reached the end of all videos</p>
                </div>
              )}
            </>
          )}

          {!loading && !error && activeTab === 'podcasts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcasts.map((podcast) => (
                <a
                  key={podcast.id}
                  href={podcast.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/30 hover:scale-105"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={podcast.image}
                      alt={podcast.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Radio className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                      {podcast.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                      {podcast.description.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDuration(podcast.duration)}</span>
                      <span>{formatDate(podcast.releaseDate)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === 'videos' && videos.length === 0 && (
            <div className="text-center py-20">
              <Youtube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No videos found</p>
            </div>
          )}

          {!loading && !error && activeTab === 'podcasts' && podcasts.length === 0 && (
            <div className="text-center py-20">
              <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No podcasts found</p>
            </div>
          )}
        </div>

        <footer className="border-t border-purple-500/30 backdrop-blur-sm bg-black/30 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
            <p>© 2025 The Rock Lore Vault. All rights reserved.</p>
            <p className="mt-2">Content automatically updates every 5 minutes</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
