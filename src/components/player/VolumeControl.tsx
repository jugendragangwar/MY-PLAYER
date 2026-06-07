import { VolumeMuteIcon, VolumeLowIcon, VolumeFullIcon } from '@/components/icons/PlayerIcons';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, isMuted, onVolumeChange, onToggleMute }: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;
  const pct = effectiveVolume * 100;

  const VolumeIcon = isMuted || volume === 0
    ? VolumeMuteIcon
    : volume < 0.5
      ? VolumeLowIcon
      : VolumeFullIcon;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleMute}
        title={isMuted ? 'Unmute' : 'Mute'}
        className="bg-transparent border-none p-1.5 cursor-pointer transition-all duration-150 text-player-muted hover:text-player-text rounded-lg hover:bg-white/5"
      >
        <VolumeIcon />
      </button>
      <div className="flex-1 relative">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full volume-range range-filled"
          style={{ '--fill-pct': `${pct}%` } as React.CSSProperties}
        />
      </div>
      <span className="font-mono text-[10px] text-player-muted tabular-nums w-7 text-right">
        {Math.round(pct)}
      </span>
    </div>
  );
}
