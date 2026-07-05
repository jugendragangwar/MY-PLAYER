import type { Track, RepeatMode } from '@/types/audio';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onTogglePlaylist?: () => void;
}

export function NowPlaying({
  track, isPlaying, isShuffle, repeatMode,
  volume, isMuted, currentTime, duration,
  onTogglePlay, onNext, onPrev, onToggleShuffle,
  onCycleRepeat, onSeek, onVolumeChange, onToggleMute, onTogglePlaylist,
}: NowPlayingProps) {
  const [artVisible, setArtVisible] = useState(true);
  const [displayedArt, setDisplayedArt] = useState(track?.albumArt);

  useEffect(() => {
    if (track?.albumArt !== displayedArt) {
      setArtVisible(false);
      const timer = setTimeout(() => {
        setDisplayedArt(track?.albumArt);
        setArtVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [track?.albumArt]); // Bug 8 fix: remove displayedArt from deps — it's set
  // *inside* this effect, so including it would re-trigger the effect after
  // every update and cause a redundant second animation cycle.

  const initials = track?.title
    ? track.title.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '♪';

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-10 lg:px-12 relative overflow-hidden">

      {displayedArt && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${displayedArt})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px) saturate(2)',
            transform: 'scale(1.2)',
            transition: 'opacity 600ms ease',
          }}
        />
      )}

      <div className="w-full max-w-[300px] mb-6 flex items-center justify-between">
        <span className="font-mono text-[10px] text-player-muted uppercase tracking-[0.2em]">
          Now Playing
        </span>
        <div className="flex items-center gap-3">
          {isPlaying && (
            <span className="flex items-end gap-[3px] h-5 opacity-80">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={onTogglePlaylist}
            className="lg:hidden bg-transparent border-none text-player-accent hover:text-player-text transition-colors p-1 cursor-pointer flex items-center justify-center"
            title="Open Playlist"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="relative mb-8 art-glow vinyl-container-3d"
        style={{ transition: 'opacity 200ms ease', opacity: artVisible ? 1 : 0 }}
      >

        <div
          className={`w-[220px] h-[220px] rounded-full flex items-center justify-center vinyl-3d-tilt vinyl-spin ${!isPlaying ? 'vinyl-spin-paused' : ''}`}
          style={{
            background: 'radial-gradient(circle at center, hsl(222 47% 8%) 30%, hsl(222 47% 6%) 55%, hsl(222 47% 9%) 65%, hsl(222 47% 6%) 80%, hsl(222 47% 10%) 100%)',
            boxShadow: '0 8px 40px hsl(0 0% 0% / 0.6), inset 0 0 30px hsl(0 0% 0% / 0.3)',
          }}
        >

          <div className="absolute inset-0 rounded-full" style={{ background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 6px, hsl(222 47% 5% / 0.3) 7px, transparent 8px)' }} />

          <div
            className="w-[90px] h-[90px] rounded-full overflow-hidden flex items-center justify-center relative z-10"
            style={{
              boxShadow: '0 0 0 3px hsl(222 47% 12%), 0 0 0 5px hsl(222 47% 8%)',
            }}
          >
            {displayedArt ? (
              <img
                src={displayedArt}
                alt={track?.title || 'Album art'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'hsl(var(--surface))' }}
              >
                <span className="font-display text-[24px] font-semibold text-player-muted select-none">
                  {initials}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="w-full max-w-[300px] text-center mb-6 relative z-10">
        <h2
          className="font-display text-player-text text-[18px] font-semibold tracking-tight truncate leading-tight"
          title={track?.title}
        >
          {track?.title || (
            <span className="text-player-muted font-normal text-[15px]">No track selected</span>
          )}
        </h2>
        <p className="font-mono text-player-muted text-[11px] mt-1.5 truncate tracking-wide">
          {track?.artist || '\u00A0'}
        </p>
        {track?.source === 'spotify' && (
          <span
            className="inline-block mt-2 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{
              background: 'hsl(var(--accent) / 0.12)',
              color: 'hsl(var(--accent))',
              border: '1px solid hsl(var(--accent) / 0.25)',
            }}
          >
            iTunes Preview
          </span>
        )}
      </div>

      <div className="w-full max-w-[300px] mb-6 relative z-10">
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      <div className="w-full max-w-[300px] mb-6 relative z-10">
        <PlayerControls
          isPlaying={isPlaying}
          isShuffle={isShuffle}
          repeatMode={repeatMode}
          onTogglePlay={onTogglePlay}
          onNext={onNext}
          onPrev={onPrev}
          onToggleShuffle={onToggleShuffle}
          onCycleRepeat={onCycleRepeat}
          hasTrack={!!track}
        />
      </div>

      <div className="w-full max-w-[300px] relative z-10">
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>
    </div>
  );
}
