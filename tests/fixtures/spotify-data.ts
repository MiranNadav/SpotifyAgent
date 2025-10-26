// Test fixtures for Spotify API responses

export const mockSong: Song = {
  id: "4uLU6hMCjMI75M1A2tKUQC",
  name: "Bohemian Rhapsody",
  artists: [
    {
      id: "1dfeR4HaWDbWqFHLkxsg1d",
      name: "Queen",
      external_urls: {
        spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d",
      },
    },
  ],
  album: {
    id: "6i6folBtxKV28WX3msQ4FE",
    name: "A Night At The Opera",
    album_type: "album",
    total_tracks: 12,
    external_urls: {
      spotify: "https://open.spotify.com/album/6i6folBtxKV28WX3msQ4FE",
    },
    images: [
      {
        url: "https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a",
        height: 640,
        width: 640,
      },
    ],
    release_date: "1975-10-31",
    release_date_precision: "day",
    artists: [
      {
        id: "1dfeR4HaWDbWqFHLkxsg1d",
        name: "Queen",
        external_urls: {
          spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d",
        },
      },
    ],
  },
  duration_ms: 355387,
  explicit: false,
  external_urls: {
    spotify: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
  },
  href: "https://api.spotify.com/v1/tracks/4uLU6hMCjMI75M1A2tKUQC",
  is_local: false,
  popularity: 85,
  preview_url: "https://p.scdn.co/mp3-preview/...",
  track_number: 11,
  type: "track",
  uri: "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
  added_at: "2023-01-15T10:30:00Z",
};

export const mockSpotifyTrackResponse: SpotifyTrackResponse = {
  href: "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
  limit: 50,
  next: null,
  offset: 0,
  previous: null,
  total: 1,
  items: [
    {
      added_at: "2023-01-15T10:30:00Z",
      track: mockSong,
    },
  ],
};

export const mockAuthTokens: AuthTokens = {
  access_token: "BQC...",
  refresh_token: "AQD...",
  token_type: "Bearer",
  expires_in: 3600,
  scope: "user-library-read playlist-modify-public",
  expires_at: new Date(Date.now() + 3600 * 1000),
};

export const mockPlaylistResponse = {
  id: "playlist-id-123",
  name: "Test Playlist",
  description: "A test playlist",
  external_urls: {
    spotify: "https://open.spotify.com/playlist/playlist-id-123",
  },
  tracks: {
    total: 0,
  },
};

import { Song, SpotifyTrackResponse } from "../../src/models/song";
import { AuthTokens } from "../../src/models/auth";

