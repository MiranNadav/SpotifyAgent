# Technical Specification: SpotifyAgent

## System Architecture

### Overview
A TypeScript-based AI agent system that leverages Spotify Web API and OpenAI API to intelligently organize and create occasion-specific playlists from a user's "Liked Songs" collection.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Auth Service │  │   CLI/API    │  │ Playlist UI │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  Playlist Manager   │  │   AI Service     │                │
│  - Filter by       │  │  - Analyze songs  │                │
│    occasion        │  │  - Extract mood   │                │
│  - Create playlist │  │  - Cache results  │                │
│  - Prioritize      │  └──────────────────┘                │
│    songs           │                                      │
└──────────────────┘                                           │
                           │
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Spotify Client   │  │  AI Client       │                │
│  │ - OAuth 2.0      │  │  (OpenAI API)    │                │
│  │ - Fetch songs    │  │  - GPT-4         │                │
│  │ - Create playlist│  │  - Analysis      │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                      External APIs                            │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Spotify API    │  │   OpenAI API     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Spotify Client (`src/clients/spotify-client.ts`)

**Responsibilities:**
- Handle OAuth 2.0 authentication flow
- Fetch user's liked songs with pagination
- Create playlists in user's account
- Manage access and refresh tokens
- Handle API rate limiting

**Key Methods:**
```typescript
class SpotifyClient {
  authenticate(): Promise<AuthTokens>
  getLikedSongs(): Promise<Song[]>
  getSongDetails(trackIds: string[]): Promise<SongDetails[]>
  createPlaylist(name: string, songs: Song[]): Promise<Playlist>
  refreshAccessToken(): Promise<string>
}
```

**Data Flow:**
1. User authorizes via OAuth → Receive auth code
2. Exchange code for tokens → Store securely
3. Fetch liked songs → Handle pagination (50 items/page)
4. Return complete song list with metadata

### 2. AI Service (`src/services/ai-service.ts`)

**Responsibilities:**
- Analyze song metadata using AI
- Extract music type, mood, energy level
- Cache results to reduce API calls
- Batch processing for efficiency

**Analysis Schema:**
```typescript
interface SongAnalysis {
  musicType: string[];      // e.g., ["pop", "electronic", "dance"]
  mood: string[];           // e.g., ["energetic", "upbeat", "happy"]
  energyLevel: number;      // 0-10 scale
  occasion: string[];       // e.g., ["party", "workout", "dancing"]
  tempo: "slow" | "medium" | "fast";
  instrumentation: string[]; // e.g., ["vocals", "drums", "synth"]
  yearVibe?: string;        // e.g., "2010s", "modern"
}
```

**Key Methods:**
```typescript
class AIService {
  analyzeSong(song: Song): Promise<SongAnalysis>
  analyzeSongsBatch(songs: Song[]): Promise<SongAnalysis[]>
  getCachedAnalysis(songId: string): SongAnalysis | null
  cacheAnalysis(songId: string, analysis: SongAnalysis): void
}
```

**AI Prompt Strategy:**
- Create structured prompts for consistent analysis
- Use function calling for structured output
- Batch requests to minimize API calls
- Implement caching layer (JSON file or database)

### 3. Playlist Manager (`src/services/playlist-manager.ts`)

**Responsibilities:**
- Match songs to occasions
- Score and rank songs by relevance
- Generate optimized playlists
- Handle playlist size constraints

**Occasion Categories:**
```typescript
type OccasionType = 
  | "party"
  | "chill"
  | "workout"
  | "beach"
  | "romantic"
  | "study"
  | "driving"
  | "focus"
  | "dance"
  | "morning"
  | "night"
  | "celebration";
```

**Key Methods:**
```typescript
class PlaylistManager {
  filterByOccasion(
    songs: Song[], 
    analyses: Map<string, SongAnalysis>,
    occasion: OccasionType
  ): Song[]
  
  scoreRelevance(
    analysis: SongAnalysis, 
    occasion: OccasionType
  ): number
  
  createPlaylist(
    occasion: OccasionType, 
    maxSongs?: number
  ): Promise<Playlist>
}
```

**Scoring Algorithm:**
- Multi-factor scoring based on:
  - Direct mood match
  - Energy level appropriateness
  - Music type relevance
  - User listening history (future enhancement)
- Rank songs by score
- Select top N songs for playlist

### 4. Data Models (`src/models/`)

**Core Types:**
```typescript
// src/models/song.ts
interface Song {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  popularity: number;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
}

interface Artist {
  id: string;
  name: string;
  genres?: string[];
}

interface Album {
  id: string;
  name: string;
  release_date: string;
  album_type: "album" | "single" | "compilation";
  genres?: string[];
  images: Image[];
}

// src/models/playlist.ts
interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  created_at: Date;
  spotify_url: string;
}

// src/models/auth.ts
interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  token_type: "Bearer";
  scope: string;
}
```

## Data Flow

### Complete Workflow

```
1. User starts application
   ↓
2. Authenticate with Spotify (OAuth 2.0)
   ↓
3. Fetch all "Liked Songs" (with pagination)
   ↓
4. For each song (in batch):
   - Check cache for analysis
   - If not cached, call AI service
   - Store analysis in cache
   ↓
5. User requests playlist for occasion
   ↓
6. Filter songs by occasion relevance
   ↓
7. Score and rank songs
   ↓
8. Select top N songs
   ↓
9. Create playlist in Spotify (optional)
   ↓
10. Return playlist to user
```

## API Integration

### Spotify Web API

**Required Scopes:**
- `user-library-read` - Read liked songs
- `playlist-modify-public` - Create public playlists
- `playlist-modify-private` - Create private playlists

**Endpoints Used:**
- `POST /api/token` - OAuth token exchange
- `GET /v1/me/tracks` - Fetch liked songs (50/page)
- `GET /v1/tracks/{id}` - Get track details
- `POST /v1/users/{user_id}/playlists` - Create playlist

**Rate Limits:**
- 600 requests per 30 seconds
- Implement exponential backoff for retries

### OpenAI API

**Model:** GPT-4 or GPT-3.5-turbo
**Approach:** Use structured outputs (JSON mode or function calling)
**Context:** Include song metadata in prompt
**Batching:** Analyze multiple songs per request where possible

## Caching Strategy

### AI Analysis Cache

**Storage:** JSON file or lightweight database (SQLite)
**Key:** Song ID (Spotify track ID)
**Value:** Complete SongAnalysis object
**Expiration:** Never (analysis is stable)
**File Location:** `data/analysis-cache.json`

**Structure:**
```json
{
  "spotify:track:ABC123": {
    "musicType": ["pop", "dance"],
    "mood": ["energetic", "happy"],
    "energyLevel": 8,
    "occasion": ["party", "workout"],
    "tempo": "fast",
    "instrumentation": ["vocals", "drums", "synth"],
    "analyzedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Error Handling

### Custom Error Classes

```typescript
class SpotifyAPIError extends Error {}
class AIServiceError extends Error {}
class AuthenticationError extends Error {}
class CacheError extends Error {}
class ConfigurationError extends Error {}
```

### Retry Strategy

- **Network errors:** Exponential backoff (1s, 2s, 4s)
- **Rate limits:** Wait for reset period
- **Auth errors:** Re-authenticate automatically
- **Transient errors:** Retry up to 3 times

## Testing Strategy

### Unit Tests

**Spotify Client:**
- Mock HTTP requests
- Test token refresh
- Test pagination handling
- Test error scenarios

**AI Service:**
- Mock OpenAI responses
- Test caching logic
- Test batch processing
- Test analysis parsing

**Playlist Manager:**
- Test filtering logic
- Test scoring algorithm
- Test playlist generation
- Test edge cases (empty songs, no matches)

### Integration Tests

- Test OAuth flow end-to-end
- Test data fetching workflow
- Test playlist creation workflow
- Test with real API (sandbox mode)

### Test Coverage Goals

- Minimum 80% overall coverage
- 100% coverage for critical business logic
- All error paths tested
- Edge cases covered

## Performance Considerations

### Optimization Techniques

1. **Batch Processing:** Analyze multiple songs per AI request
2. **Caching:** Store AI analysis results permanently
3. **Parallel Execution:** Fetch songs in parallel where possible
4. **Lazy Loading:** Only analyze songs when needed
5. **Incremental Updates:** Only analyze new songs

### Scalability

- Can handle 1000s of songs with caching
- Efficient batch processing for AI requests
- Minimal external API calls
- Local cache reduces repeated analyses

## Security

### Token Management

- Store tokens securely (environment variables)
- Never commit secrets to repository
- Implement automatic token refresh
- Use secure HTTP (HTTPS) for OAuth callbacks

### Data Privacy

- User data stays local (except API calls)
- No external storage of personal data
- Caching is local only
- No tracking or analytics

## Future Enhancements

### Phase 2
- Web UI for easier interaction
- Advanced filtering options
- Playlist editing capabilities
- Export to other formats

### Phase 3
- Machine learning from user preferences
- Collaborative playlists
- Playlist recommendations
- Integration with other music platforms

### Phase 4
- Real-time listening analytics
- Auto-updating playlists
- Cross-platform support
- Mobile app

## Dependencies

### Required Packages

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "openai": "^4.0.0",
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Project setup and configuration
- [ ] Spotify OAuth implementation
- [ ] Basic song fetching
- [ ] Unit tests for Spotify client

### Phase 2: AI Integration (Week 2)
- [ ] AI service implementation
- [ ] Caching system
- [ ] Batch processing
- [ ] Unit tests for AI service

### Phase 3: Playlist Generation (Week 3)
- [ ] Playlist manager implementation
- [ ] Scoring algorithm
- [ ] Occasion matching
- [ ] Integration tests

### Phase 4: Polish (Week 4)
- [ ] Error handling improvements
- [ ] CLI interface
- [ ] Documentation
- [ ] Performance optimization

