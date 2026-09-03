'use client';

// ═══════════════════════════════════════════════════════
// Guided Audio Tour & Voiceover Bar
// Dynamic Island style audio player for Imagine Cup Pitch
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Maximize2,
  Headphones,
  RotateCcw,
} from 'lucide-react';

export function AudioTourBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(149);
  const [currentTime, setCurrentTime] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 149)) * 100);
    };

    const onLoadedMetadata = () => {
      if (audio.duration) setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy prevented playback
      });
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pos * (audioRef.current.duration || 149);
  };

  // Chapter caption cue based on current timestamp
  const getChapterCaption = (t: number) => {
    if (t < 20) return '1. The Network Decay Problem';
    if (t < 42) return '2. Mathematical Cadence SLAs';
    if (t < 68) return '3. 60-Second Morning Speed Run';
    if (t < 94) return '4. Interactive Network Topology';
    if (t < 114) return '5. Time-Travel Decay Simulator';
    if (t < 132) return '6. Career Radar & AI Inbox';
    return '7. Autonomous Dossiers & Offline Sync';
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (closed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 3500,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="animate-fade-in-up"
    >
      <audio ref={audioRef} src="/audio/voiceover.wav" preload="metadata" />

      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="btn btn-primary"
          style={{
            borderRadius: 30,
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 12px 30px rgba(79, 70, 229, 0.4)',
          }}
          title="Expand Voiceover Pitch Player"
        >
          <Headphones size={16} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
            {isPlaying ? 'Playing Pitch...' : 'Audio Pitch Tour'}
          </span>
        </button>
      ) : (
        <div
          style={{
            width: 380,
            maxWidth: 'calc(100vw - 48px)',
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 20,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
            padding: '16px 20px',
            color: '#f8fafc',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(79, 70, 229, 0.25)',
                  color: 'var(--np-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={12} />
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--np-accent)', letterSpacing: '0.04em' }}>
                Imagine Cup Voiceover Tour
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setMinimized(true)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                title="Minimize player"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setClosed(true);
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                title="Close player"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chapter Caption Pill */}
          <div
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{getChapterCaption(currentTime)}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Scrubber Bar */}
          <div
            onClick={handleSeek}
            style={{
              height: 5,
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              cursor: 'pointer',
              marginBottom: 14,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4f46e5, #06b6d4)',
                borderRadius: 3,
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={togglePlay}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: 'var(--np-accent)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: 2 }} />}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    if (!isPlaying) togglePlay();
                  }
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
                title="Restart Tour"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <button
              onClick={toggleMute}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
