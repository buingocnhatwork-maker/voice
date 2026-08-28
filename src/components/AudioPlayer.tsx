import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Download,
  Repeat,
  Share2,
  Check,
  Activity,
} from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  voiceName: string;
  styleName: string;
  textSnippet: string;
  charCount?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  voiceName,
  styleName,
  textSnippet,
  charCount,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioPeaks, setAudioPeaks] = useState<number[]>([]);

  // Generate simulated or decoded waveform peaks when audioUrl changes
  useEffect(() => {
    const barsCount = 56;
    const peaks: number[] = [];
    let seed = 42;
    for (let i = 0; i < textSnippet.length; i++) {
      seed = (seed * 31 + textSnippet.charCodeAt(i)) % 100000;
    }
    for (let i = 0; i < barsCount; i++) {
      seed = (seed * 16807) % 2147483647;
      const val = 0.2 + 0.8 * (seed / 2147483647);
      const env = Math.sin((i / barsCount) * Math.PI);
      peaks.push(Math.max(0.12, Math.min(1.0, val * (0.35 + 0.65 * env))));
    }
    setAudioPeaks(peaks);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioUrl, textSnippet]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      audio.playbackRate = playbackRate;
      audio.volume = isMuted ? 0 : volume;
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playbackRate, volume, isMuted, isLooping]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback error:', e);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    const safeVoice = voiceName.toLowerCase().replace(/\s+/g, '-');
    const safeStyle = styleName.toLowerCase().replace(/\s+/g, '-');
    const timestamp = Date.now();
    a.download = `tts-${safeVoice}-${safeStyle}-${timestamp}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(audioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="studio-audio-player"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 sm:p-6 space-y-5"
    >
      <audio ref={audioRef} src={audioUrl} loop={isLooping} preload="metadata" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-[#111827] text-white flex items-center justify-center font-medium shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#111827]">
                Master Waveform Output
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                {voiceName}
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-[#111827] text-white">
                {styleName}
              </span>
            </div>
            {charCount && (
              <p className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                {charCount} chars • 24,000Hz Studio Master (PCM 16-bit WAV)
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="copy-audio-data-btn"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#374151] bg-[#F3F4F6] hover:bg-[#E5E7EB] border border-[#D1D5DB] transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            title="Copy Data URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="download-wav-btn"
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-white bg-[#111827] hover:bg-black transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download WAV</span>
          </button>
        </div>
      </div>

      {/* Dynamic Geometric Waveform Visualizer */}
      <div className="relative pt-1 pb-1">
        <div
          className="h-20 flex items-center justify-between gap-[2px] px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg cursor-pointer overflow-hidden relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            if (audioRef.current && duration > 0) {
              const newTime = ratio * duration;
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
        >
          {audioPeaks.map((peak, idx) => {
            const barProgress = (idx / audioPeaks.length) * 100;
            const isPlayed = barProgress <= progressPercent;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-center items-center h-full"
              >
                <div
                  className={`w-full rounded-xs transition-all duration-75 ${
                    isPlayed
                      ? 'bg-[#111827]'
                      : 'bg-[#D1D5DB]'
                  }`}
                  style={{
                    height: `${Math.max(10, peak * 88)}%`,
                  }}
                />
              </div>
            );
          })}

          {/* Precise Playhead indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#111827] pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Scrub Slider */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek time"
          className="w-full h-1 bg-[#E5E7EB] rounded-sm appearance-none cursor-pointer accent-[#111827] mt-2.5"
        />

        {/* Timestamps */}
        <div className="flex justify-between text-xs font-mono font-medium text-[#6B7280] mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Left: Play/Pause and Skip buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="audio-skip-back-btn"
            onClick={() => handleSkip(-5)}
            className="p-2 rounded-md text-[#374151] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="audio-play-pause-btn"
            onClick={togglePlayPause}
            className="h-12 w-12 rounded-full bg-[#111827] hover:bg-black text-white flex items-center justify-center shadow-sm transition-all transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            id="audio-skip-fwd-btn"
            onClick={() => handleSkip(5)}
            className="p-2 rounded-md text-[#374151] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors cursor-pointer"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="audio-loop-toggle-btn"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 rounded-md transition-colors border cursor-pointer ${
              isLooping
                ? 'bg-[#111827] text-white border-[#111827]'
                : 'text-[#6B7280] hover:bg-[#F3F4F6] border-transparent hover:border-[#E5E7EB]'
            }`}
            title={isLooping ? 'Loop is On' : 'Loop is Off'}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Playback Speed Selector */}
        <div className="flex items-center space-x-1 bg-[#F3F4F6] p-1 rounded-md border border-[#E5E7EB]">
          {[0.75, 1.0, 1.2, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              type="button"
              id={`speed-btn-${rate}x`}
              onClick={() => handleRateChange(rate)}
              className={`px-2.5 py-1 rounded-sm text-xs font-mono font-bold transition-all cursor-pointer ${
                playbackRate === rate
                  ? 'bg-white text-[#111827] shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Right: Volume Control */}
        <div className="flex items-center space-x-2 min-w-[130px]">
          <button
            type="button"
            id="audio-mute-toggle-btn"
            onClick={toggleMute}
            className="text-[#374151] hover:text-[#111827] p-1 cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="w-20 h-1 bg-[#E5E7EB] rounded-sm appearance-none cursor-pointer accent-[#111827]"
          />
        </div>
      </div>
    </div>
  );
};

