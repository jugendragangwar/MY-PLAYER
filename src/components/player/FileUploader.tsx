import { useCallback, useRef, useState } from 'react';
import type { Track } from '@/types/audio';
import { UploadIcon } from '@/components/icons/PlayerIcons';
import { saveLocalTrack } from '@/lib/db';

interface FileUploaderProps {
  onAddTrack: (track: Track) => void;
}

const ACCEPTED = '.mp3,.wav,.ogg,.flac,.aac';

export function FileUploader({ onAddTrack }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '');

    const tempAudio = new Audio();
    tempAudio.src = url;
    tempAudio.addEventListener('loadedmetadata', () => {
      const track: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: name,
        artist: 'Local File',
        albumArt: null,
        src: url,
        duration: tempAudio.duration || 0,
        source: 'local',
      };
      onAddTrack(track);
      saveLocalTrack(track, file);
    });
    tempAudio.addEventListener('error', () => {
      const track: Track = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: name,
        artist: 'Local File',
        albumArt: null,
        src: url,
        duration: 0,
        source: 'local',
      };
      onAddTrack(track);
    });
  }, [onAddTrack]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const allowedExts = ACCEPTED.split(',');
    Array.from(files).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (allowedExts.includes(ext) || file.type.startsWith('audio/')) {
        processFile(file);
      }
    });
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
      style={{
        background: isDragOver
          ? 'hsl(var(--accent) / 0.08)'
          : 'hsl(var(--surface-2))',
        border: `1.5px dashed ${isDragOver ? 'hsl(var(--accent) / 0.6)' : 'hsl(var(--border))'}`,
        transition: 'all 200ms ease',
      }}
      onMouseEnter={e => {
        if (!isDragOver) (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--accent) / 0.35)';
      }}
      onMouseLeave={e => {
        if (!isDragOver) (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
      }}
    >
      <span
        className="transition-colors duration-200 flex-shrink-0"
        style={{ color: isDragOver ? 'hsl(var(--accent))' : 'hsl(var(--text-muted))' }}
      >
        <UploadIcon />
      </span>
      <div>
        <div className="flex gap-2 mb-1">
          <button 
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="font-display text-[12px] font-medium text-player-text bg-surface-2 px-2 py-1 rounded hover:opacity-80 transition"
          >
            Select Files
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
            className="font-display text-[12px] font-medium text-player-text bg-surface-2 px-2 py-1 rounded hover:opacity-80 transition"
          >
            Select Folder
          </button>
        </div>
        <p className="font-mono text-[10px] text-player-muted">
          MP3, WAV, OGG, FLAC, AAC
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        accept={ACCEPTED}
        webkitdirectory=""
        directory=""
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
