export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string | null;
  src: string;
  duration: number;
  source: 'spotify' | 'local';
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface PlayerState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
}

export type PlayerAction =
  | { type: 'SET_TRACKS'; tracks: Track[] }
  | { type: 'ADD_TRACK'; track: Track }
  | { type: 'REMOVE_TRACK'; id: string }
  | { type: 'SET_CURRENT_INDEX'; index: number }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'CYCLE_REPEAT' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' };
