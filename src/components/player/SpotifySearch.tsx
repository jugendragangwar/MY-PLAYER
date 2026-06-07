import { useState, useCallback } from 'react';
import type { Track } from '@/types/audio';

interface SpotifySearchProps {
  onAddTrack: (track: Track) => void;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function SpotifySearch({ onAddTrack }: SpotifySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setAddedIds(new Set());

    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=15`);

      if (!res.ok) throw new Error(`Search failed (${res.status})`);

      const json = await res.json();

      const tracks: Track[] = json.results?.map((item: any) => ({
        id: item.trackId.toString(),
        title: item.trackName,
        artist: item.artistName,
        albumArt: item.artworkUrl100?.replace('100x100bb', '300x300bb') || null,
        src: item.previewUrl,
        duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
        source: 'spotify' as const,
      })) || [];

      setResults(tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleAdd = useCallback((track: Track) => {
    onAddTrack(track);
    setAddedIds(prev => new Set([...prev, track.id]));
  }, [onAddTrack]);

  return (
    <div style={{ borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-3 p-4"
        style={{ borderBottom: results.length > 0 || error ? '1px solid hsl(var(--border) / 0.4)' : undefined }}
      >
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
          style={{
            background: 'hsl(var(--surface-2))',
            border: '1px solid hsl(var(--border) / 0.6)',
          }}
          onFocus={() => {}}
        >
          <span className="text-player-muted flex-shrink-0">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search music — powered by iTunes…"
            className="flex-1 bg-transparent font-display text-[13px] text-player-text placeholder:text-player-muted outline-none min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setError(null); }}
              className="text-player-muted hover:text-player-text transition-colors bg-transparent border-none cursor-pointer p-0 flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="font-mono text-white text-[11px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-200 border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          style={{
            background: 'hsl(var(--accent))',
            color: '#ffffff',
            fontWeight: 600,
          }}
          onMouseEnter={e => !isLoading && ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.22-8.56" strokeLinecap="round" />
              </svg>
            </span>
          ) : 'Go'}
        </button>
      </form>

      {error && (
        <div className="px-4 pb-3 pt-2">
          <p className="font-mono text-[10px] text-red-400 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
          {results.map((track) => {
            const hasPreview = !!track.src;
            const isAdded = addedIds.has(track.id);
            return (
              <button
                key={track.id}
                onClick={() => hasPreview && !isAdded && handleAdd(track)}
                disabled={!hasPreview || isAdded}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 border-none
                  ${hasPreview && !isAdded ? 'cursor-pointer hover:bg-white/4' : 'cursor-not-allowed opacity-40'}
                `}
                style={{ background: 'transparent' }}
                onMouseEnter={e => { if (hasPreview && !isAdded) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--surface-2))'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >

                <div
                  className="rounded-lg overflow-hidden flex-shrink-0"
                  style={{ width: 36, height: 36, minWidth: 36, background: 'hsl(var(--surface-2))' }}
                >
                  {track.albumArt ? (
                    <img src={track.albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-[12px] font-medium text-player-text truncate">{track.title}</p>
                  <p className="font-mono text-[10px] text-player-muted truncate">{track.artist}</p>
                </div>

                {isAdded ? (
                  <span className="flex-shrink-0 font-mono text-[10px] text-green-400 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Added
                  </span>
                ) : hasPreview ? (
                  <span
                    className="flex-shrink-0 flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full transition-all"
                    style={{
                      color: 'hsl(var(--accent))',
                      border: '1px solid hsl(var(--accent) / 0.3)',
                    }}
                  >
                    <AddIcon />
                    Add
                  </span>
                ) : (
                  <span className="flex-shrink-0 font-mono text-[10px] text-player-muted">No preview</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
