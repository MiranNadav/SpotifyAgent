// Playlist models

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  created_at: Date;
  spotify_url: string;
  total_tracks: number;
}

export interface CreatePlaylistRequest {
  name: string;
  description: string;
  public?: boolean;
  collaborative?: boolean;
}

export interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  tracks: {
    total: number;
  };
}

import { Song } from "./song";

