// components/landing/LandingVideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Maximize2, 
  RotateCcw 
} from "lucide-react";

interface LandingVideoPlayerProps {
  videoSrc: string;
  posterSrc: string;
  title?: string;
}

export function LandingVideoPlayer({
  videoSrc,
  posterSrc,
  title = "FYPMate Platform Walkthrough Video",
}: LandingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sync muted state to HTML5 video element
  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    setHasInteracted(true);

    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    setHasInteracted(true);
    if (videoRef.current.paused || isEnded) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setIsEnded(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mobile / Desktop fullscreen toggle
  const toggleFullscreen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (container?.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
    } else if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => {});
    } else if ((video as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
      // iOS Safari native fullscreen support
      (video as unknown as { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
    setIsEnded(false);
  };

  // Attempt autoplay safely on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={togglePlay}
      className="group relative aspect-[2086/1080] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 shadow-inner select-none cursor-pointer"
      role="region"
      aria-label={title}
    >
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={title}
        className="absolute inset-0 w-full h-full object-cover block"
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Subtle play/pause center micro-indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity">
          <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-2xl border border-white/20 transition-transform active:scale-95">
            {isEnded ? (
              <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <Play className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* Interactive Controls Overlay */}
      <div 
        className={`absolute inset-x-0 bottom-0 z-20 p-2.5 sm:p-3.5 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-200 ${
          isHovered || !isPlaying || !hasInteracted ? "opacity-100" : "opacity-90 sm:opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress track */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-2 sm:mb-2.5 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls: Play/Pause */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={isEnded ? handleRestart : togglePlay}
              className="p-1.5 sm:p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isEnded ? (
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Mobile / Desktop Fullscreen Expand */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
              title="Full Screen (HD View)"
              aria-label="View video in full screen"
            >
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Right Controls: High-Visibility Audio Toggle Pill */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-lg transition-all active:scale-95 ${
              isMuted
                ? "bg-black/60 hover:bg-black/80 text-white border-white/20"
                : "bg-emerald-500/90 hover:bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-500/20"
            }`}
            title={isMuted ? "Click to unmute sound" : "Mute sound"}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                <span className="font-semibold tracking-wide">Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                <span className="font-semibold tracking-wide">Sound On</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
