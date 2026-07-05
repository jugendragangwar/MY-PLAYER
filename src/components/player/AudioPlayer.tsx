import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { PlayerState, PlayerAction, Track, RepeatMode } from '@/types/audio';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { NowPlaying } from '@/components/player/NowPlaying';
import { PlaylistPanel } from '@/components/player/PlaylistPanel';

import { getAllLocalTracks, removeLocalTrack } from '@/lib/db';

const STORAGE_KEY = 'player:playlist';
const PREFS_KEY = 'player:prefs';

function loadInitialState(): PlayerState {
  let tracks: Track[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      tracks = JSON.parse(stored).filter((t: Track) => t.source !== 'local');
    }
  } catch {}

  let volume = 0.8;
  let isShuffle = false;
  let repeatMode: RepeatMode = 'none';
  try {
    const prefs = localStorage.getItem(PREFS_KEY);
    if (prefs) {
      const p = JSON.parse(prefs);
      volume = p.volume ?? 0.8;
      isShuffle = p.isShuffle ?? false;
      repeatMode = p.repeatMode ?? 'none';
    }
  } catch {}

  return {
    tracks,
    currentIndex: 0,
    isPlaying: false,
    isShuffle,
    repeatMode,
    volume,
    isMuted: false,
  };
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACKS':
      return { ...state, tracks: action.tracks, currentIndex: 0 };
    case 'ADD_TRACK':
      return { ...state, tracks: [...state.tracks, action.track] };
    case 'REMOVE_TRACK': {
      const idx = state.tracks.findIndex(t => t.id === action.id);
      if (idx === -1) return state;
      const newTracks = state.tracks.filter(t => t.id !== action.id);
      let newIndex = state.currentIndex;
      if (idx < state.currentIndex) newIndex--;
      else if (idx === state.currentIndex) newIndex = Math.min(newIndex, newTracks.length - 1);
      return {
        ...state,
        tracks: newTracks,
        currentIndex: Math.max(0, newIndex),
        // Bug 5 fix: stop playback when the last track is removed so the
        // isPlaying effect runs and pauses the audio element.
        isPlaying: newTracks.length === 0 ? false : state.isPlaying,
      };
    }
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.index, isPlaying: true };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffle: !state.isShuffle };
    case 'CYCLE_REPEAT': {
      const modes: RepeatMode[] = ['none', 'all', 'one'];
      const next = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
      return { ...state, repeatMode: next };
    }
    case 'SET_VOLUME':
      return { ...state, volume: action.volume, isMuted: false };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'NEXT_TRACK': {
      if (state.tracks.length === 0) return state;
      if (state.repeatMode === 'one') return { ...state, isPlaying: true };
      if (state.isShuffle) {
        // Bug 4 fix: keep rolling until we get a different index so shuffle
        // always actually advances to a new track.
        if (state.tracks.length === 1) return { ...state, isPlaying: true };
        let next: number;
        do {
          next = Math.floor(Math.random() * state.tracks.length);
        } while (next === state.currentIndex);
        return { ...state, currentIndex: next, isPlaying: true };
      }
      const next = state.currentIndex + 1;
      if (next >= state.tracks.length) {
        if (state.repeatMode === 'all') return { ...state, currentIndex: 0, isPlaying: true };
        return { ...state, isPlaying: false };
      }
      return { ...state, currentIndex: next, isPlaying: true };
    }
    case 'PREV_TRACK': {
      if (state.tracks.length === 0) return state;
      const prev = state.currentIndex - 1;
      if (prev < 0) {
        if (state.repeatMode === 'all') return { ...state, currentIndex: state.tracks.length - 1, isPlaying: true };
        return { ...state, currentIndex: 0 };
      }
      return { ...state, currentIndex: prev, isPlaying: true };
    }
    default:
      return state;
  }
}

export default function AudioPlayer() {
  const [state, dispatch] = useReducer(playerReducer, undefined, loadInitialState);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const currentTrack = state.tracks[state.currentIndex] ?? null;
  const prevTrackRef = useRef<string | null>(null);

  const audio = useAudioPlayer({
    onEnded: () => dispatch({ type: 'NEXT_TRACK' }),
    onError: () => dispatch({ type: 'NEXT_TRACK' }),
  });

  useEffect(() => {
    if (!currentTrack) return;
    const trackId = currentTrack.id;
    if (prevTrackRef.current !== trackId) {
      prevTrackRef.current = trackId;
      audio.loadTrack(currentTrack);
      if (state.isPlaying) {
        const el = audio.audioRef.current;
        if (el) {
          const onCanPlay = () => { audio.play(); };
          // Bug 3 fix: { once: true } auto-removes the listener after it fires.
          // The returned cleanup removes it if the user skips before canplay
          // fires, preventing a stale listener from triggering on the next track.
          el.addEventListener('canplay', onCanPlay, { once: true });
          return () => el.removeEventListener('canplay', onCanPlay);
        }
      }
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    // Bug 5 fix: remove the `currentTrack` guard so we always call pause()
    // even when the track list is empty (audio element keeps playing otherwise).
    if (state.isPlaying) {
      if (currentTrack) audio.play();
    } else {
      audio.pause();
    }
  }, [state.isPlaying]);

  useEffect(() => {
    if (state.isMuted) {
      audio.mute();
    } else {
      audio.unmute();
      audio.setVolume(state.volume);
    }

  }, [state.volume, state.isMuted]);

  useEffect(() => {
    const toStore = state.tracks.filter(t => t.source !== 'local');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [state.tracks]);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      volume: state.volume,
      isShuffle: state.isShuffle,
      repeatMode: state.repeatMode,
    }));
  }, [state.volume, state.isShuffle, state.repeatMode]);

  // Bug 7 fix: depend on audio.seek (stable useCallback ref) not the whole
  // audio object which is a new plain object reference on every render.
  const handleSeek = useCallback((seconds: number) => {
    audio.seek(seconds);
  }, [audio.seek]);

  useEffect(() => {
    const loadLocal = async () => {
      const localTracks = await getAllLocalTracks();
      if (localTracks.length > 0) {
        localTracks.forEach(t => dispatch({ type: 'ADD_TRACK', track: t }));
      }
    };
    loadLocal();
  }, []);

  const handleRemoveTrack = async (id: string) => {
    // Bug 6 fix: revoke the blob URL before removing the track to prevent
    // ObjectURL memory leaks during long sessions.
    const track = state.tracks.find(t => t.id === id);
    if (track?.src?.startsWith('blob:')) {
      URL.revokeObjectURL(track.src);
    }
    dispatch({ type: 'REMOVE_TRACK', id });
    if (id.startsWith('local-')) {
      await removeLocalTrack(id);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-player-bg relative">

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        <div
          className="w-full flex-1 lg:w-[420px] lg:flex-none flex flex-col lg:h-full lg:overflow-y-auto"
          style={{ borderRight: '1px solid hsl(var(--border) / 0.4)' }}
        >
          <NowPlaying
            track={currentTrack}
            isPlaying={state.isPlaying}
            isShuffle={state.isShuffle}
            repeatMode={state.repeatMode}
            volume={state.volume}
            isMuted={state.isMuted}
            currentTime={audio.currentTime}
            duration={audio.duration}
            onTogglePlay={() => dispatch({ type: 'TOGGLE_PLAY' })}
            onNext={() => dispatch({ type: 'NEXT_TRACK' })}
            onPrev={() => dispatch({ type: 'PREV_TRACK' })}
            onToggleShuffle={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
            onCycleRepeat={() => dispatch({ type: 'CYCLE_REPEAT' })}
            onSeek={handleSeek}
            onVolumeChange={(v) => dispatch({ type: 'SET_VOLUME', volume: v })}
            onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
            onTogglePlaylist={() => setIsPlaylistOpen(!isPlaylistOpen)}
          />
        </div>

        <div 
          className={`
            fixed inset-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:translate-y-0 lg:flex-1 lg:flex lg:flex-col lg:h-full lg:overflow-hidden
            ${isPlaylistOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}
        >

          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsPlaylistOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 h-[80vh] lg:h-full lg:relative bg-player-bg glass-card rounded-t-[32px] lg:rounded-none overflow-hidden flex flex-col shadow-2xl lg:shadow-none">

            <div className="flex justify-center p-3 lg:hidden" onClick={() => setIsPlaylistOpen(false)}>
              <div className="w-12 h-1.5 rounded-full bg-player-border" />
            </div>

            <PlaylistPanel
              tracks={state.tracks}
              currentIndex={state.currentIndex}
              isPlaying={state.isPlaying}
              onSelectTrack={(i) => { dispatch({ type: 'SET_CURRENT_INDEX', index: i }); setIsPlaylistOpen(false); }}
              onRemoveTrack={handleRemoveTrack}
              onAddTrack={(track) => dispatch({ type: 'ADD_TRACK', track })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
