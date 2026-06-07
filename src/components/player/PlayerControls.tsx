import type { RepeatMode } from '@/types/audio';
import {
  PlayIcon, PauseIcon, SkipNextIcon, SkipPrevIcon,
  ShuffleIcon, RepeatIcon,
} from '@/components/icons/PlayerIcons';

interface PlayerControlsProps {
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  hasTrack: boolean;
}

export function PlayerControls({
  isPlaying, isShuffle, repeatMode,
  onTogglePlay, onNext, onPrev,
  onToggleShuffle, onCycleRepeat, hasTrack,
}: PlayerControlsProps) {
  const iconBtnBase = "bg-transparent border-none p-2 cursor-pointer transition-all duration-200 ease rounded-full hover:bg-white/5";

  return (
    <div className="flex items-center justify-between">

      <button
        onClick={onToggleShuffle}
        className={iconBtnBase}
        title="Shuffle"
        style={{
          opacity: isShuffle ? 1 : 0.4,
          color: isShuffle ? 'hsl(var(--accent))' : 'hsl(var(--text-primary))',
        }}
      >
        <ShuffleIcon />
      </button>

      <button
        onClick={onPrev}
        className={`${iconBtnBase} opacity-60 hover:opacity-100 text-player-text`}
        title="Previous"
      >
        <SkipPrevIcon />
      </button>

      <button
        onClick={onTogglePlay}
        disabled={!hasTrack}
        title={isPlaying ? 'Pause' : 'Play'}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${isPlaying ? 'play-btn-glow' : ''}`}
        style={{
          background: hasTrack
            ? 'linear-gradient(135deg, hsl(var(--accent)), hsl(258 70% 55%))'
            : 'hsl(var(--surface))',
          border: 'none',
          cursor: hasTrack ? 'pointer' : 'not-allowed',
          transform: 'scale(1)',
          transition: 'transform 150ms ease, box-shadow 150ms ease',
        }}
        onMouseEnter={e => { if (hasTrack) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.94)'; }}
        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
      >
        <span style={{ color: 'hsl(222 47% 5%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>

      <button
        onClick={onNext}
        className={`${iconBtnBase} opacity-60 hover:opacity-100 text-player-text`}
        title="Next"
      >
        <SkipNextIcon />
      </button>

      <button
        onClick={onCycleRepeat}
        className={`${iconBtnBase} relative`}
        title={`Repeat: ${repeatMode}`}
        style={{
          opacity: repeatMode !== 'none' ? 1 : 0.4,
          color: repeatMode !== 'none' ? 'hsl(var(--accent))' : 'hsl(var(--text-primary))',
        }}
      >
        <RepeatIcon />
        {repeatMode === 'one' && (
          <span
            className="absolute -bottom-0.5 -right-0.5 font-mono text-[8px] leading-none w-3.5 h-3.5 flex items-center justify-center rounded-full"
            style={{ background: 'hsl(var(--accent))', color: 'hsl(222 47% 5%)' }}
          >
            1
          </span>
        )}
      </button>
    </div>
  );
}
