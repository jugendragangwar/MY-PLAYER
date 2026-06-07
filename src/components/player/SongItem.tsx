import type { Track } from '@/types/audio';
import { PlayIcon, CloseIcon } from '@/components/icons/PlayerIcons';

interface SongItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function formatDuration(s: number): string {
  if (!isFinite(s) || s <= 0) return '--:--';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function SongItem({ track, index, isActive, isPlaying, onSelect, onRemove }: SongItemProps) {
  const isNonPlayable = !track.src;

  return (
    <div
      className={`group relative flex items-center h-[60px] px-4 cursor-pointer transition-all duration-200
        ${isNonPlayable ? 'opacity-[0.35] pointer-events-none' : ''}
        animate-slide-in
      `}
      style={{
        background: isActive
          ? 'linear-gradient(90deg, hsl(var(--accent) / 0.08) 0%, transparent 100%)'
          : 'transparent',
        borderLeft: isActive
          ? '2px solid hsl(var(--accent))'
          : '2px solid transparent',
        boxShadow: isActive ? '-2px 0 16px hsl(var(--accent) / 0.12)' : 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--surface-2) / 0.5)';
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
      onClick={onSelect}
    >

      <div
        className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ width: 36, height: 36, minWidth: 36, marginRight: 12, background: 'hsl(var(--surface-2))' }}
      >
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt=""
            className="group-hover:hidden"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : null}
        <span
          className={`font-mono text-[10px] text-player-muted ${track.albumArt ? 'hidden group-hover:flex' : 'flex'} items-center justify-center`}
          style={{ width: '100%', height: '100%' }}
        >
          {isPlaying ? (
              <span className="flex items-end gap-[2px]" style={{ height: 16 }}>
                <span className="wave-bar" style={{ animationDuration: '0.7s' }} />
                <span className="wave-bar" style={{ animationDuration: '0.7s', animationDelay: '0.1s' }} />
                <span className="wave-bar" style={{ animationDuration: '0.7s', animationDelay: '0.2s' }} />
              </span>
          ) : (
            <span className="group-hover:hidden">{String(index + 1).padStart(2, '0')}</span>
          )}
          <span className="hidden group-hover:flex items-center justify-center text-player-accent">
            <PlayIcon />
          </span>
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-display text-[13px] font-medium truncate leading-tight"
          style={{ color: isActive ? 'hsl(var(--accent))' : 'hsl(var(--text-primary))' }}
        >
          {track.title}
        </p>
        <p className="font-mono text-[10px] text-player-muted truncate leading-tight mt-0.5">
          {track.artist}
        </p>
      </div>

      <span className="font-mono text-[10px] text-player-muted tabular-nums flex-shrink-0 mx-3">
        {formatDuration(track.duration)}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 transition-all duration-150 bg-transparent border-none cursor-pointer text-player-muted hover:text-red-400 p-1 rounded-md hover:bg-red-400/10"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
