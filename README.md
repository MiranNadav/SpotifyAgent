# SpotifyAgent

An AI-powered agent system that intelligently organizes your Spotify "Liked Songs" into occasion-relevant playlists using AI analysis.

## Overview

SpotifyAgent solves the problem of having a massive "Liked Songs" collection by:
1. **Fetching** your entire "Liked Songs" playlist from Spotify
2. **Analyzing** each song using AI to extract music type and mood characteristics
3. **Creating** custom playlists for specific occasions (party, chill, beach, workout, etc.)

### Example Use Cases
- "I need a party playlist!" → Gets upbeat, energetic songs from your liked songs
- "Make me a chill playlist" → Filters calm, relaxed tracks
- "Beach vibes please" → Creates a tropical, summery collection
- "Workout time" → Selects high-energy, motivating tracks

## Features

- 🎵 Automatic playlist generation based on occasion
- 🤖 AI-powered music analysis (mood, genre, energy level)
- 🔄 Syncs with your real Spotify "Liked Songs"
- 🎯 Intelligent song selection for specific occasions
- 💾 Caching to minimize API calls and improve performance
- 🔐 Secure OAuth authentication with Spotify

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or higher installed
- **npm** or **yarn** package manager
- A **Spotify Developer Account** (free)
- An **OpenAI API key** (or compatible AI service)

## Setup Instructions

### 1. Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set the redirect URI to `http://localhost:3000/callback` (or your preferred localhost port)
4. Save your **Client ID** and **Client Secret**

### 2. Environment Configuration

1. Clone this repository
2. Create a `.env` file in the root directory:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
OPENAI_API_KEY=your_openai_api_key
PORT=3000
```

3. Replace the placeholder values with your actual credentials

### 3. Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### 4. Build the Project

```bash
npm run build
```

## Execution Instructions

### Development Mode

```bash
npm run dev
```

This will start the application in development mode with hot-reloading.

### Production Mode

```bash
npm start
```

### Run Tests

```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Usage

### Basic Usage

Once the application is running, you can:

1. **Authenticate with Spotify** - Open your browser to the localhost URL
2. **Grant permissions** - Authorize the app to access your liked songs
3. **Create a playlist** - Provide an occasion or mood:
   ```bash
   npm run create-playlist "party"
   ```

### Example Commands

```bash
# Create a chill playlist
npm run create-playlist "chill"

# Create a workout playlist
npm run create-playlist "workout"

# Create a beach playlist
npm run create-playlist "beach sunset"

# Create a romantic dinner playlist
npm run create-playlist "romantic dinner"
```

## Project Structure

```
SpotifyAgent/
├── src/
│   ├── clients/          # External API clients (Spotify)
│   ├── services/         # Core business logic
│   │   ├── ai-service.ts
│   │   ├── playlist-manager.ts
│   ├── models/           # TypeScript type definitions
│   ├── config/           # Configuration management
│   ├── utils/            # Helper functions
│   └── index.ts          # Main entry point
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── fixtures/         # Test data
├── .cursorrules          # Development rules
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### 1. Authentication Flow
- User authorizes the app via Spotify OAuth 2.0
- App receives access and refresh tokens
- Tokens are stored securely for subsequent API calls

### 2. Data Fetching
- Fetches all songs from "Liked Songs" playlist
- Handles pagination for large collections
- Extracts song metadata (title, artist, album, etc.)

### 3. AI Analysis
- Sends song metadata to AI service (OpenAI GPT-4)
- AI analyzes each song and extracts:
  - Music type/genre
  - Mood characteristics
  - Energy level
  - Occasion relevance
- Results are cached to minimize API calls

### 4. Playlist Creation
- User specifies an occasion (e.g., "party", "chill")
- System filters analyzed songs based on occasion relevance
- Creates a new playlist with the most suitable tracks
- Optionally creates the playlist in user's Spotify account

## Testing

This project includes comprehensive tests:
- **Unit tests** for individual functions and components
- **Integration tests** for API interactions (mocked)
- **End-to-end tests** for complete workflows

Run all tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SPOTIFY_CLIENT_ID` | Spotify API client ID | Yes |
| `SPOTIFY_CLIENT_SECRET` | Spotify API client secret | Yes |
| `SPOTIFY_REDIRECT_URI` | OAuth callback URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (development/production) |

## Troubleshooting

### Common Issues

**"Invalid client credentials"**
- Verify your Spotify Client ID and Secret are correct
- Ensure the redirect URI matches exactly in Spotify Dashboard

**"Rate limit exceeded"**
- The app implements rate limiting protection
- Wait a few minutes and try again
- Consider implementing caching for frequently used songs

**"OpenAI API error"**
- Check your OpenAI API key is valid
- Ensure you have sufficient API credits
- Review the AI service configuration

## Contributing

This is a personal project, but suggestions for improvements are welcome!

## License

MIT License - Feel free to use and modify as needed.

## Future Enhancements

- [ ] Web UI for easier interaction
- [ ] Multiple occasion types at once
- [ ] Learning from user preferences
- [ ] Collaborative playlist creation
- [ ] Export to other music platforms
- [ ] Automatic playlist updates

## Support

For issues or questions, please open an issue in the repository.

