// Data models for Spotify API responses

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
  genres?: string[];
  images?: Image[];
}

export interface Album {
  id: string;
  name: string;
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  external_urls: {
    spotify: string;
  };
  images: Image[];
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  artists: Artist[];
  genres?: string[];
}

export interface Song {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  is_local: boolean;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  added_at: string; // ISO 8601 timestamp
}

export interface SpotifyTrackResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: Array<{
    added_at: string;
    track: Song;
  }>;
}

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

