const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const NodeCache = require('node-cache');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors());
app.use(express.json());

let spotifyAccessToken = null;
let spotifyTokenExpiry = null;

async function getSpotifyAccessToken() {
  if (spotifyAccessToken && spotifyTokenExpiry && Date.now() < spotifyTokenExpiry) {
    return spotifyAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    spotifyAccessToken = response.data.access_token;
    spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000);

    return spotifyAccessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error.response?.data || error.message);
    throw error;
  }
}

app.get('/api/videos', async (req, res) => {
  try {
    const pageToken = req.query.pageToken;
    const cacheKey = pageToken ? `videos_${pageToken}` : 'videos';
    
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'YouTube API key not configured',
        message: 'Please set YOUTUBE_API_KEY in the .env file'
      });
    }

    const params = {
      key: apiKey,
      channelId: channelId,
      part: 'snippet',
      order: 'date',
      maxResults: 12,
      type: 'video',
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      { params }
    );

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    }));

    const result = {
      videos,
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching YouTube videos:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

app.get('/api/podcasts', async (req, res) => {
  try {
    const cachedPodcasts = cache.get('podcasts');
    if (cachedPodcasts) {
      return res.json(cachedPodcasts);
    }

    const showId = process.env.SPOTIFY_SHOW_ID;
    const accessToken = await getSpotifyAccessToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/shows/${showId}/episodes`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          limit: 12,
          market: 'US',
        },
      }
    );

    const podcasts = response.data.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.images[0]?.url,
      releaseDate: item.release_date,
      duration: item.duration_ms,
      externalUrl: item.external_urls.spotify,
    }));

    cache.set('podcasts', podcasts);
    res.json(podcasts);
  } catch (error) {
    console.error('Error fetching Spotify podcasts:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch podcasts',
      message: error.response?.data?.error?.message || error.message
    });
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    cache.flushAll();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ error: 'Failed to refresh cache' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
