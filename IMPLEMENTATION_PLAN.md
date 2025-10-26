# Implementation Plan: SpotifyAgent

This document outlines the step-by-step implementation plan for building the SpotifyAgent system.

## Phase 1: Project Setup

### Tasks
- [ ] Initialize npm project with TypeScript
- [ ] Install core dependencies (axios, openai, dotenv, commander, inquirer)
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Set up Jest for testing
- [ ] Configure ESLint and Prettier
- [ ] Create directory structure
- [ ] Set up .env.example file

### Deliverables
- Working TypeScript compilation
- Test suite setup
- Code formatting and linting configured
- Basic project structure

### Estimated Time: 2-3 hours

---

## Phase 2: Spotify Client Implementation

### Tasks
- [ ] Create SpotifyClient class
- [ ] Implement OAuth 2.0 flow
- [ ] Implement token management (storage, refresh)
- [ ] Implement fetchLikedSongs() with pagination
- [ ] Implement getSongDetails()
- [ ] Add error handling and retries
- [ ] Write unit tests for SpotifyClient
- [ ] Test with real Spotify API

### Key Components
```typescript
// src/clients/spotify-client.ts
class SpotifyClient {
  private accessToken: string;
  private refreshToken: string;
  
  authenticate(): Promise<AuthTokens>
  getLikedSongs(): Promise<Song[]>
  getSongDetails(trackIds: string[]): Promise<SongDetails[]>
  createPlaylist(name: string, description: string, songs: Song[]): Promise<Playlist>
}
```

### Deliverables
- Functional Spotify authentication
- Ability to fetch all liked songs
- Comprehensive error handling
- Full test coverage

### Estimated Time: 4-5 hours

---

## Phase 3: AI Service Implementation

### Tasks
- [ ] Create AIClient wrapper for OpenAI
- [ ] Design AI prompt template for song analysis
- [ ] Implement batch analysis functionality
- [ ] Create SongAnalysis type definitions
- [ ] Write unit tests for AIClient
- [ ] Test AI analysis with sample songs

### Key Components
```typescript
// src/services/ai-service.ts
class AIService {
  private aiClient: AIClient;
  private cacheService: CacheService;
  
  analyzeSong(song: Song): Promise<SongAnalysis>
  analyzeSongsBatch(songs: Song[]): Promise<SongAnalysis[]>
}
```

### AI Analysis Schema
```typescript
interface SongAnalysis {
  musicType: string[];
  mood: string[];
  energyLevel: number; // 0-10
  occasion: string[];
  tempo: "slow" | "medium" | "fast";
  instrumentation: string[];
}
```

### Deliverables
- AI analysis of songs
- Structured output parsing
- Error handling for AI failures
- Full test coverage with mocked AI responses

### Estimated Time: 3-4 hours

---

## Phase 4: Caching System

### Tasks
- [ ] Create CacheService class
- [ ] Implement cache file storage (JSON)
- [ ] Add cache read/write methods
- [ ] Implement cache invalidation logic
- [ ] Add cache backup mechanism
- [ ] Write tests for CacheService
- [ ] Integrate cache with AIService

### Key Components
```typescript
// src/services/cache-service.ts
class CacheService {
  private cacheFile: string = "data/analysis-cache.json";
  
  getAnalysis(songId: string): SongAnalysis | null
  setAnalysis(songId: string, analysis: SongAnalysis): void
  clearCache(): void
}
```

### Deliverables
- Persistent caching system
- Cache file management
- Integration with AI service
- Tests for cache operations

### Estimated Time: 2-3 hours

---

## Phase 5: Playlist Manager

### Tasks
- [ ] Create PlaylistManager class
- [ ] Implement occasion-based filtering
- [ ] Design scoring algorithm
- [ ] Implement playlist generation logic
- [ ] Handle edge cases (no matches, small collections)
- [ ] Write unit tests for PlaylistManager
- [ ] Test with various occasions and song sets

### Key Components
```typescript
// src/services/playlist-manager.ts
class PlaylistManager {
  private spotifyClient: SpotifyClient;
  private aiService: AIService;
  
  filterByOccasion(songs: Song[], occasion: OccasionType): Song[]
  scoreRelevance(analysis: SongAnalysis, occasion: OccasionType): number
  createPlaylist(occasion: OccasionType, maxSongs?: number): Promise<Playlist>
}
```

### Scoring Algorithm
1. Direct mood match (40% weight)
2. Energy level appropriateness (30% weight)
3. Music type relevance (20% weight)
4. Occasion type match (10% weight)

### Deliverables
- Intelligent playlist generation
- Scoring algorithm implementation
- Support for multiple occasions
- Comprehensive tests

### Estimated Time: 4-5 hours

---

## Phase 6: CLI Interface

### Tasks
- [ ] Set up Commander.js for CLI
- [ ] Implement interactive prompts with Inquirer
- [ ] Add "create-playlist" command
- [ ] Add "analyze-songs" command
- [ ] Add "list-occasions" command
- [ ] Implement progress indicators
- [ ] Add colored output for better UX
- [ ] Write CLI tests

### CLI Commands
```bash
# Analyze all liked songs
npm run analyze

# Create playlist for occasion
npm run create-playlist "party"

# List available occasions
npm run list-occasions

# Show statistics
npm run stats
```

### Deliverables
- User-friendly CLI
- Interactive commands
- Progress feedback
- Clear error messages

### Estimated Time: 3-4 hours

---

## Phase 7: Integration & Testing

### Tasks
- [ ] Write integration tests for complete flows
- [ ] Test with real Spotify account (sandbox)
- [ ] Test with various song collections
- [ ] Performance testing (large playlists)
- [ ] Error scenario testing
- [ ] Load testing (API rate limits)
- [ ] User acceptance testing

### Test Scenarios
1. Full flow: Auth → Fetch → Analyze → Create Playlist
2. Large collection handling (1000+ songs)
3. No cache scenario (first run)
4. Cache hit scenario (subsequent runs)
5. Error recovery (network failures, API errors)
6. Different occasion types

### Deliverables
- All integration tests passing
- Performance benchmarks
- Error handling verified
- Ready for production use

### Estimated Time: 3-4 hours

---

## Phase 8: Documentation & Polish

### Tasks
- [ ] Review and update README.md
- [ ] Add code comments for complex logic
- [ ] Create API documentation
- [ ] Add usage examples
- [ ] Create troubleshooting guide
- [ ] Add screenshots/examples
- [ ] Final code review

### Deliverables
- Complete documentation
- Clear usage instructions
- Code comments where needed
- User examples

### Estimated Time: 2-3 hours

---

## Summary

**Total Estimated Time:** 21-30 hours

**Core Components to Build:**
1. ✅ Project setup and configuration
2. Spotify client (OAuth, API integration)
3. AI service (song analysis, caching)
4. Playlist manager (matching, scoring)
5. CLI interface (user interaction)
6. Tests (unit, integration)
7. Documentation (README, examples)

**Dependencies to Install:**
```bash
npm install axios openai dotenv commander inquirer
npm install -D typescript @types/node jest ts-jest eslint prettier
```

**Files to Create:**
- Configuration files (.tsconfig, jest.config, eslint, prettier)
- Core implementation files (clients, services, models, utils)
- Test files (unit tests, integration tests, fixtures)
- Documentation files (README, examples)

---

## Next Steps

1. Review this implementation plan
2. Start with Phase 1: Project Setup
3. Follow phases sequentially
4. Test each phase before moving to next
5. Make adjustments based on learning

## Development Guidelines

- **Test-driven development:** Write tests first
- **Incremental commits:** Commit after each phase
- **Code quality:** Follow .cursorrules guidelines
- **Documentation:** Update docs as you build
- **User feedback:** Test with real use cases

