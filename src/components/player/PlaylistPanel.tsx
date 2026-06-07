import type { Track } from '@/types/audio';
import { SongItem } from './SongItem';
import { FileUploader } from './FileUploader';

interface PlaylistPanelProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (id: string) => void;
  onAddTrack: (track: Track) => void;
}

export function PlaylistPanel({
  tracks, currentIndex, isPlaying,
  onSelectTrack, onRemoveTrack, onAddTrack,
}: PlaylistPanelProps) {
  return (
    <div className="flex flex-col h-full">

      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-4 rounded-full"
            style={{ background: 'linear-gradient(to bottom, hsl(var(--accent)), hsl(var(--accent-2)))' }}
          />
          <span className="font-display text-[13px] font-semibold text-player-text tracking-tight">
            Playlist
          </span>
        </div>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: 'hsl(var(--surface-2))',
            color: 'hsl(var(--text-muted))',
          }}
        >
          {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-12 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'hsl(var(--surface-2))' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--text-muted))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-display text-[13px] text-player-text font-medium mb-1">No tracks yet</p>
              <p className="font-mono text-[10px] text-player-muted">
                Search music above or upload audio files
              </p>
            </div>
          </div>
        ) : (
          tracks.map((track, index) => (
            <SongItem
              key={track.id}
              track={track}
              index={index}
              isActive={index === currentIndex}
              isPlaying={index === currentIndex && isPlaying}
              onSelect={() => onSelectTrack(index)}
              onRemove={() => onRemoveTrack(track.id)}
            />
          ))
        )}
      </div>

      <div
        className="p-4"
        style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
      >
        <FileUploader onAddTrack={onAddTrack} />

        <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid hsl(var(--border) / 0.2)' }}>
          <p className="font-mono text-[9px] text-player-muted uppercase tracking-widest opacity-50">
            &copy; {new Date().getFullYear()} Precision Audio — Developed by Jugendra Gangwar
          </p>
        </div>
      </div>
    </div>
  );
}
