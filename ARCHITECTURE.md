# Architecture Plan: SpotifyAgent

## System Overview

SpotifyAgent is designed as a modular, TypeScript-based system that acts as an intelligent intermediary between Spotify and AI services to organize music collections.

## Core Design Principles

1. **Separation of Concerns** - Each module has a single responsibility
2. **Dependency Injection** - Easy to test and maintain
3. **Type Safety** - Full TypeScript usage with strict mode
4. **Caching** - Minimize external API calls and costs
5. **Error Resilience** - Graceful handling of failures
6. **Scalability** - Handle large collections efficiently

## Directory Structure

```
SpotifyAgent/
├── src/
│   ├── clients/
│   │   ├── spotify-client.ts       # Spotify API integration
│   │   └── ai-client.ts            # OpenAI API integration
│   ├── services/
│   │   ├── ai-service.ts           # Music analysis logic
│   │   ├── playlist-manager.ts     # Playlist generation
│   │   └── cache-service.ts        # Caching layer
│   ├── models/
│   │   ├── song.ts                 # Song data models
│   │   ├── playlist.ts             # Playlist models
│   │   ├── auth.ts                 # Authentication models
│   │   └── analysis.ts              # AI analysis models
│   ├── utils/
│   │   ├── logger.ts               # Logging utility
│   │   ├── retry.ts                # Retry logic
│   │   └── validators.ts           # Input validation
│   ├── config/
│   │   ├── index.ts                # Configuration loader
│   │   └── constants.ts            # System constants
│   ├── cli/
│   │   ├── commands.ts             # CLI commands
│   │   └── prompts.ts              # User prompts
│   └── index.ts                    # Main entry point
├── tests/
│   ├── unit/
│   │   ├── clients/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── spotify-flow.spec.ts
│   │   └── ai-flow.spec.ts
│   ├── fixtures/
│   │   ├── songs.json
│   │   └── analyses.json
│   └── mocks/
│       ├── spotify-api.ts
│       └── openai-api.ts
├── data/
│   └── analysis-cache.json         # AI results cache
├── .env.example
├── .env                              # Local environment (gitignored)
├── .cursorrules
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── package.json
├── README.md
├── TECHNICAL_SPEC.md
└── ARCHITECTURE.md (this file)
```

## Component Architecture

### 1. Client Layer

**Purpose:** Abstract external API interactions

#### SpotifyClient
- **File:** `src/clients/spotify-client.ts`
- **Dependencies:** `axios`, `dotenv`
- **Responsibilities:**
  - OAuth 2.0 authentication flow
  - Token management and refresh
  - Fetch liked songs (with pagination)
  - Get song details
  - Create playlists
  - Rate limiting handling
- **Error Handling:** Custom `SpotifyAPIError` class
- **Retries:** Exponential backoff for network errors

#### AIClient
- **File:** `src/clients/ai-client.ts`
- **Dependencies:** `openai`
- **Responsibilities:**
  - Send analysis requests to OpenAI
  - Handle API errors and rate limits
  - Batch multiple songs per request
  - Parse and structure responses
- **Error Handling:** Custom `AIServiceError` class
- **Rate Limiting:** Built into OpenAI SDK

### 2. Service Layer

**Purpose:** Business logic and orchestration

#### AIService
- **File:** `src/services/ai-service.ts`
- **Dependencies:** `AIClient`, `CacheService`
- **Responsibilities:**
  - Coordinate AI analysis of songs
  - Check cache before calling AI
  - Batch songs for efficiency
  - Format AI prompts
  - Parse AI responses into structured data
- **Key Methods:**
  ```typescript
  analyzeSong(song: Song): Promise<SongAnalysis>
  analyzeSongsBatch(songs: Song[]): Promise<SongAnalysis[]>
  ```

#### PlaylistManager
- **File:** `src/services/playlist-manager.ts`
- **Dependencies:** `SpotifyClient`, `AIService`
- **Responsibilities:**
  - Match songs to occasions
  - Score song relevance
  - Filter and rank songs
  - Generate optimized playlists
  - Handle edge cases (no matches, too few songs)
- **Scoring Algorithm:**
  - Multi-criteria scoring system
  - Weighted factors based on occasion type
  - Diversity considerations

#### CacheService
- **File:** `src/services/cache-service.ts`
- **Dependencies:** File system access
- **Responsibilities:**
  - Store AI analysis results
  - Retrieve cached analyses
  - Manage cache file
  - Handle cache corruption
- **Storage:** JSON file with backup mechanism

### 3. Model Layer

**Purpose:** Type definitions and data structures

#### Song Models (`src/models/song.ts`)
```typescript
interface Song {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  // ... additional fields
}
```

#### Analysis Models (`src/models/analysis.ts`)
```typescript
interface SongAnalysis {
  musicType: string[];
  mood: string[];
  energyLevel: number;
  occasion: string[];
  // ... additional fields
}
```

#### Playlist Models (`src/models/playlist.ts`)
```typescript
interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  // ... additional fields
}
```

### 4. Configuration Layer

**Purpose:** Environment and configuration management

- Centralized config loading
- Type-safe environment variables
- Default values for optional settings
- Validation of required settings

## Data Flow Diagrams

### Authentication Flow

```
1. User -> CLI: Start app
2. CLI -> User: Generate auth URL
3. User -> Browser: Open auth URL
4. Browser -> Spotify: Authenticate
5. Spotify -> Browser: Redirect with code
6. Browser -> CLI: Return code
7. CLI -> SpotifyClient: Exchange code for tokens
8. SpotifyClient -> CLI: Store tokens
```

### Song Analysis Flow

```
1. User -> CLI: Request playlist for "party"
2. CLI -> PlaylistManager: Get playlist for occasion
3. PlaylistManager -> SpotifyClient: Fetch liked songs
4. SpotifyClient -> Spotify API: Get songs (paginated)
5. Spotify API -> SpotifyClient: Return song data
6. SpotifyClient -> PlaylistManager: Return songs
7. PlaylistManager -> AIService: Analyze songs (batch)
8. AIService -> CacheService: Check cache
9. For each song:
   9a. If cached -> Use cached analysis
   9b. If not -> Call AIClient, then cache
10. AIService -> PlaylistManager: Return analyses
11. PlaylistManager -> PlaylistManager: Filter and score
12. PlaylistManager -> CLI: Return playlist
```

## API Integration Details

### Spotify Web API Integration

**Authentication:**
- Authorization Code flow (OAuth 2.0)
- PKCE for enhanced security
- Token refresh mechanism
- Token storage (memory/encrypted file)

**Endpoints:**
```
POST   https://accounts.spotify.com/api/token
GET    https://api.spotify.com/v1/me/tracks
GET    https://api.spotify.com/v1/tracks/{id}
POST   https://api.spotify.com/v1/users/{user_id}/playlists
POST   https://api.spotify.com/v1/playlists/{id}/tracks
```

**Rate Limiting:**
- 600 requests / 30 seconds per user
- Implement queuing and retry logic
- Respect `Retry-After` headers

### OpenAI API Integration

**Model:** GPT-4 or GPT-3.5-turbo
**Strategy:** Structured outputs using function calling

**Prompt Template:**
```
Analyze this song for playlist organization:

Song: "{name}" by {artists}
Album: "{album}" ({year})

Extract:
1. Music type/genre
2. Mood characteristics
3. Energy level (0-10)
4. Suitable occasions
5. Tempo (slow/medium/fast)

Respond in JSON format.
```

**Batching:** Process 5-10 songs per request to optimize costs

## Caching Strategy

### Cache Structure

**File:** `data/analysis-cache.json`
**Format:** JSON object with song IDs as keys

```json
{
  "spotify:track:4uLU6hMCjMI75M1A2tKUQC": {
    "musicType": ["indie", "rock"],
    "mood": ["melancholic", "introspective"],
    "energyLevel": 4,
    "occasion": ["chill", "study", "late-night"],
    "tempo": "slow",
    "analyzedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Cache Management

- **Read:** Check cache before API call
- **Write:** Store after API call
- **Invalidation:** Never (analysis is stable)
- **Size:** Unbounded (JSON file grows)
- **Backup:** Git commit cache file (optional)

## Error Handling Strategy

### Error Hierarchy

```
Error
├── SpotifyError
│   ├── AuthenticationError
│   ├── RateLimitError
│   └── APIError
├── AIError
│   ├── RateLimitError
│   └── AnalysisError
└── ApplicationError
    ├── ConfigurationError
    └── ValidationError
```

### Retry Logic

**Network Errors:**
- Retry 3 times with exponential backoff
- Intervals: 1s, 2s, 4s

**Rate Limit Errors:**
- Wait for reset period
- Implement exponential backoff
- Max wait: 60 seconds

**Auth Errors:**
- Automatically refresh tokens
- Re-authenticate if refresh fails
- Prompt user if needed

## Testing Architecture

### Unit Tests (80% coverage goal)

**Test Structure:**
```
tests/unit/
├── clients/
│   ├── spotify-client.spec.ts
│   └── ai-client.spec.ts
├── services/
│   ├── ai-service.spec.ts
│   ├── playlist-manager.spec.ts
│   └── cache-service.spec.ts
└── utils/
    ├── logger.spec.ts
    └── validators.spec.ts
```

**Mocking Strategy:**
- Mock external API calls (HTTP)
- Use fixtures for test data
- Mock file system operations
- Test edge cases and errors

### Integration Tests

**Test Scenarios:**
1. Complete OAuth flow
2. Fetch and analyze songs
3. Generate playlist for different occasions
4. Error recovery scenarios

**Integration Test Setup:**
- Use real API endpoints with test credentials
- Or use comprehensive mocks
- Test with real-world data samples

## Performance Optimization

### Optimization Techniques

1. **Parallel Requests:** Fetch songs concurrently
2. **Batch AI Calls:** Analyze 5-10 songs per request
3. **Caching:** Store all AI analyses
4. **Lazy Loading:** Only analyze when needed
5. **Streaming:** Process results as they arrive

### Performance Targets

- Analyze 1000 songs: < 5 minutes (with cache)
- Fetch liked songs: < 30 seconds
- Generate playlist: < 10 seconds
- AI API calls: < 100 calls for 1000 songs (batching)

## Security Considerations

### Data Protection

- **Tokens:** Store in environment variables only
- **Cache:** Local file only (no cloud storage)
- **API Keys:** Never in code or logs
- **User Data:** Not shared with third parties

### Secure Practices

- Use HTTPS for all API calls
- Implement PKCE for OAuth
- Sanitize all user inputs
- Validate API responses
- Handle secrets properly

## Deployment Considerations

### Local Development

1. Clone repository
2. Install dependencies
3. Configure `.env` file
4. Run `npm run dev`

### Production Deployment (Future)

- Containerization with Docker
- Environment variable management
- Logging and monitoring
- Error tracking (Sentry)
- Health checks

## Monitoring and Observability

### Logging

- Use structured logging (JSON format)
- Log levels: DEBUG, INFO, WARN, ERROR
- Include context (user ID, request ID)
- Sanitize sensitive data

### Metrics (Future)

- API call counts
- Cache hit rates
- Processing times
- Error rates
- User activity

## Dependencies Management

### Core Dependencies

```json
{
  "axios": "HTTP client for API calls",
  "openai": "Official OpenAI SDK",
  "dotenv": "Environment variable management",
  "commander": "CLI framework",
  "inquirer": "Interactive CLI prompts"
}
```

### Development Dependencies

```json
{
  "typescript": "Type safety",
  "jest": "Testing framework",
  "ts-jest": "TypeScript + Jest",
  "eslint": "Code linting",
  "prettier": "Code formatting"
}
```

## Extension Points

### Adding New Occasions

1. Define occasion in PlaylistManager
2. Create scoring rules
3. Update AI prompt to recognize occasion
4. Add CLI command

### Adding New AI Models

1. Create adapter interface
2. Implement adapter for new model
3. Swap implementation in AIService
4. Configure in environment

### Adding Web UI (Future)

1. Create Express server
2. Add authentication middleware
3. Create API endpoints
4. Add frontend (React/Vue)

