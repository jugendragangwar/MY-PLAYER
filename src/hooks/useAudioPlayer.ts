import { useRef, useState, useEffect, useCallback } from 'react';
import type { Track } from '@/types/audio';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onError?: () => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      options.onEnded?.();
    };
    const onError = () => {
      setIsPlaying(false);
      options.onError?.();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };

  }, []);

  const loadTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    setDuration(track.duration || 0);
  }, []);

  const play = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch (e) {
      console.warn('Play failed:', e);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  const mute = useCallback(() => {
    if (audioRef.current) audioRef.current.muted = true;
  }, []);

  const unmute = useCallback(() => {
    if (audioRef.current) audioRef.current.muted = false;
  }, []);

  return {
    play, pause, seek, setVolume, mute, unmute, loadTrack,
    currentTime, duration: duration || 0, isPlaying,
  };
}
