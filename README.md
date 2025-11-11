# The Rock Lore Vault

A MERN stack web application that displays YouTube videos and Spotify podcasts from The Rock Lore Vault channel with a rock star themed interface.

## Features

- Display latest YouTube videos from The Rock Lore Vault channel
- Display latest podcast episodes from Spotify
- Rock star themed UI with gradient backgrounds and smooth animations
- Auto-refresh content every 5 minutes
- Manual refresh button
- Responsive design for mobile and desktop
- Caching system to reduce API calls

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Axios, Node-Cache
- **APIs**: YouTube Data API v3, Spotify Web API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- YouTube Data API key
- Spotify API credentials (Client ID and Client Secret)

## Getting API Keys

### YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

### Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Create a new app
4. Copy the Client ID and Client Secret

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
PORT=5000
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=UCxOXbHBqVUIVYAyj_ChFXVg
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_SHOW_ID=1POPwB6teXOFzfuuE49KVZ
```

4. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Open your browser and navigate to `http://localhost:5173`
4. Toggle between YouTube Videos and Podcasts tabs
5. Click on any video or podcast to open it in YouTube or Spotify
6. Use the Refresh button to manually update content

## API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `GET /api/videos` - Fetch latest YouTube videos
- `GET /api/podcasts` - Fetch latest Spotify podcast episodes
- `GET /api/refresh` - Clear cache and force refresh

## Project Structure

```
therocklorevault/
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## Features Details

### Auto-Refresh
Content automatically refreshes every 5 minutes to display new videos and podcasts.

### Caching
The backend implements a caching system with a 1-hour TTL to reduce API calls and improve performance.

### Rock Star Theme
The UI features:
- Dark gradient backgrounds (purple, pink, red)
- Smooth hover animations
- Glowing shadows on active elements
- Responsive grid layout
- Custom icons from Lucide

## Troubleshooting

### Backend Issues

**Error: YouTube API key not configured**
- Make sure you've added your YouTube API key to the backend `.env` file

**Error: Spotify credentials not configured**
- Make sure you've added your Spotify Client ID and Client Secret to the backend `.env` file

**Error: Failed to fetch content**
- Check that the backend server is running on port 5000
- Verify your API keys are valid and have the correct permissions

### Frontend Issues

**Cannot connect to backend**
- Ensure the backend server is running
- Check that `VITE_API_URL` in frontend `.env` points to the correct backend URL

**CORS errors**
- The backend has CORS enabled by default, but if you're running on different ports, ensure the backend CORS configuration allows your frontend origin

## License

MIT License

## Author

Built with ❤️ for The Rock Lore Vault community
