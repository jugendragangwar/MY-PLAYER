interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '00:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div>

      <div className="relative group py-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="w-full range-filled"
          style={{
            '--fill-pct': `${pct}%`,
            height: '3px',
            cursor: 'pointer',
          } as React.CSSProperties}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="font-mono text-[10px] text-player-muted tabular-nums">
          {formatTime(currentTime)}
        </span>
        <span className="font-mono text-[10px] text-player-muted tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
