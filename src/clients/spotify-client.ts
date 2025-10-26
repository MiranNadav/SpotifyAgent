// Spotify API client with OAuth 2.0 authentication

import axios, { AxiosInstance } from "axios";
import { Config, loadConfig } from "../config";
import { AuthTokens, TokenRefreshResponse } from "../models/auth";
import { Song, SpotifyTrackResponse } from "../models/song";
import { CreatePlaylistRequest, SpotifyPlaylistResponse } from "../models/playlist";
import { SpotifyAPIError, AuthenticationError, RateLimitError, NetworkError } from "../utils/errors";
import { retryWithBackoff } from "../utils/retry";

export class SpotifyClient {
  private config: Config;
  private httpClient: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor(config?: Config) {
    this.config = config || loadConfig();
    this.httpClient = axios.create({
      baseURL: "https://api.spotify.com/v1",
      timeout: 10000,
    });

    // Add request interceptor for authentication
    this.httpClient.interceptors.request.use((config) => {
      if (this.tokens && config.headers) {
        config.headers.Authorization = `Bearer ${this.tokens.access_token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 401) {
            throw new AuthenticationError("Invalid or expired token");
          } else if (status === 429) {
            const retryAfter = error.response.headers["retry-after"];
            throw new RateLimitError(
              "Rate limit exceeded",
              retryAfter ? parseInt(retryAfter, 10) : undefined
            );
          } else {
            throw new SpotifyAPIError(
              data?.error?.message || "Spotify API error",
              status,
              data
            );
          }
        } else if (error.request) {
          throw new NetworkError("Network error", error);
        } else {
          throw new Error(error.message);
        }
      }
    );
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.spotify.clientId,
      response_type: "code",
      redirect_uri: this.config.spotify.redirectUri,
      scope: "user-library-read playlist-modify-public playlist-modify-private",
      ...(state && { state }),
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<AuthTokens> {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: this.config.spotify.redirectUri,
          client_id: this.config.spotify.clientId,
          client_secret: this.config.spotify.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const tokenData = response.data;
      this.tokens = {
        ...tokenData,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      };

      return this.tokens!;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AuthenticationError(
          error.response?.data?.error_description || "Token exchange failed"
        );
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.tokens?.refresh_token) {
      throw new AuthenticationError("No refresh token available");
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.tokens.refresh_token,
          client_id: this.config.spotify.clientId,
          client_secret: this.config.spotify.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const tokenData: TokenRefreshResponse = response.data;
      
      this.tokens = {
        ...this.tokens,
        access_token: tokenData.access_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      };

      return this.tokens.access_token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AuthenticationError(
          error.response?.data?.error_description || "Token refresh failed"
        );
      }
      throw error;
    }
  }

  /**
   * Check if token is expired and refresh if needed
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.tokens) {
      throw new AuthenticationError("Not authenticated");
    }

    // Refresh token if it expires in the next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (this.tokens.expires_at <= fiveMinutesFromNow) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Fetch all liked songs with pagination
   */
  async getLikedSongs(): Promise<Song[]> {
    await this.ensureValidToken();

    const allSongs: Song[] = [];
    let nextUrl: string | null = "/me/tracks?limit=50";

    while (nextUrl) {
      const response = await retryWithBackoff(async () => {
        return this.httpClient.get<SpotifyTrackResponse>(nextUrl!);
      });

      const data = response.data;
      const songs = data.items.map((item) => item.track);
      allSongs.push(...songs);

      nextUrl = data.next ? data.next.replace("https://api.spotify.com/v1", "") : null;
    }

    return allSongs;
  }

  /**
   * Get detailed information for specific tracks
   */
  async getTrackDetails(trackIds: string[]): Promise<Song[]> {
    await this.ensureValidToken();

    // Spotify API allows up to 50 tracks per request
    const batches = [];
    for (let i = 0; i < trackIds.length; i += 50) {
      batches.push(trackIds.slice(i, i + 50));
    }

    const allTracks: Song[] = [];

    for (const batch of batches) {
      const response = await retryWithBackoff(async () => {
        return this.httpClient.get(`/tracks?ids=${batch.join(",")}`);
      });

      allTracks.push(...response.data.tracks);
    }

    return allTracks;
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(request: CreatePlaylistRequest): Promise<SpotifyPlaylistResponse> {
    await this.ensureValidToken();

    // First, get the current user's ID
    const userResponse = await this.httpClient.get("/me");
    const userId = userResponse.data.id;

    const response = await retryWithBackoff(async () => {
      return this.httpClient.post(`/users/${userId}/playlists`, {
        name: request.name,
        description: request.description,
        public: request.public ?? false,
        collaborative: request.collaborative ?? false,
      });
    });

    return response.data;
  }

  /**
   * Add tracks to a playlist
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    await this.ensureValidToken();

    // Spotify API allows up to 100 tracks per request
    const batches = [];
    for (let i = 0; i < trackUris.length; i += 100) {
      batches.push(trackUris.slice(i, i + 100));
    }

    for (const batch of batches) {
      await retryWithBackoff(async () => {
        return this.httpClient.post(`/playlists/${playlistId}/tracks`, {
          uris: batch,
        });
      });
    }
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  /**
   * Get current tokens (for persistence)
   */
  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  /**
   * Set tokens (for restoring from storage)
   */
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
  }
}

