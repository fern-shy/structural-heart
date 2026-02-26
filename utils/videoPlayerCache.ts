import { createVideoPlayer, type VideoPlayer } from 'expo-video';

type PlayerEntry = {
  player: VideoPlayer;
  uri: string;
};

/**
 * Manages a pool of persistent VideoPlayer instances keyed by source URI.
 * Players created via createVideoPlayer survive component unmounts,
 * so the same player can be reused across inline ↔ fullscreen transitions
 * without re-downloading the video.
 */
export class VideoPlayerCache {
  private entries = new Map<string, PlayerEntry>();

  getOrCreate(uri: string, setup?: (p: VideoPlayer) => void): VideoPlayer {
    const existing = this.entries.get(uri);
    if (existing) return existing.player;

    const player = createVideoPlayer(uri);
    if (setup) setup(player);
    this.entries.set(uri, { player, uri });
    return player;
  }

  has(uri: string): boolean {
    return this.entries.has(uri);
  }

  releaseAll(): void {
    this.entries.forEach(({ player }) => {
      try {
        player.release();
      } catch {
        // Player may already be released
      }
    });
    this.entries.clear();
  }
}
