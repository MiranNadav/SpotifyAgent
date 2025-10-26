// Authentication models for Spotify OAuth

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  expires_at: Date; // Calculated expiration time
}

export interface AuthCodeResponse {
  code: string;
  state?: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

export interface SpotifyAuthError {
  error: string;
  error_description: string;
}

