"use client";

import { useEffect, useRef, useState } from "react";
import { playlists, Track } from "@/lib/music-data";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function PlayButton({
  playing,
  onToggle,
  size = "normal",
}: {
  playing: boolean;
  onToggle: () => void;
  size?: "normal" | "large";
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center justify-center rounded-full transition-transform active:scale-95 ${
        size === "large"
          ? "w-[48px] h-[48px] bg-white text-black shadow-lg hover:scale-105"
          : "w-11 h-11 bg-white text-black shadow-md hover:scale-105"
      }`}
    >
      {playing ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

function PrevButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
      </svg>
    </button>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      </svg>
    </button>
  );
}

function ShuffleButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${active ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    </button>
  );
}

function PlaylistButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/80">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    </button>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Player() {
  const [mounted, setMounted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [thumbQuality, setThumbQuality] = useState<'maxresdefault' | 'hqdefault' | 'none'>('maxresdefault');

  const playlist = playlists["Playlist 1"];
  const currentTrack = playlist[trackIndex];

  // Initialize track from localStorage or random
  useEffect(() => {
    const savedVideoId = localStorage.getItem('showerHour:currentTrackId');
    if (savedVideoId) {
      const idx = playlist.findIndex(t => t.videoId === savedVideoId);
      if (idx !== -1) {
        setTrackIndex(idx);
        setMounted(true);
        return;
      }
    }
    // Random song for first visit or if saved track not found
    setTrackIndex(Math.floor(Math.random() * playlist.length));
    setMounted(true);
  }, [playlist]);

  // Save current track whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('showerHour:currentTrackId', currentTrack.videoId);
    }
  }, [trackIndex, currentTrack.videoId, mounted]);

  // Reset thumbnail quality to maxres when track changes
  useEffect(() => {
    setThumbQuality('maxresdefault');
  }, [currentTrack.videoId]);

  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = (isAutoPlay = false) => {
    if (isAutoPlay) setAutoPlayNext(true);
    if (shuffle) {
      setTrackIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setTrackIndex((prev) => (prev < playlist.length - 1 ? prev + 1 : 0));
    }
  };

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  // Load YouTube API
  useEffect(() => {
    if (!mounted) return;

    const initPlayer = () => {
      if (playerRef.current) return;
      
      let startSeconds = 0;
      const savedTime = localStorage.getItem('showerHour:currentTime');
      if (savedTime) startSeconds = Math.floor(parseFloat(savedTime));

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: currentTrack.videoId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          start: startSeconds,
        },
        events: {
          onReady: (event: any) => {
            if (event.target.getDuration) setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
              if (event.target.getDuration) setDuration(event.target.getDuration());
              if (!progressIntervalRef.current) {
                let ticks = 0;
                progressIntervalRef.current = setInterval(() => {
                  if (event.target.getCurrentTime) {
                    const t = event.target.getCurrentTime();
                    setCurrentTime(t);
                    // Throttle saving time to every 5 seconds (every 10th tick of 500ms)
                    if (++ticks % 10 === 0) {
                      localStorage.setItem('showerHour:currentTime', t.toString());
                    }
                  }
                }, 500);
              }
            } else {
              setPlaying(false);
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              if (event.data === window.YT.PlayerState.ENDED) {
                handleNextRef.current(true); // true means auto-play next track
              }
            }
          },
          onError: (event: any) => {
            console.warn("YouTube video unavailable (likely disabled embedding). Skipping to next...", event.data);
            handleNextRef.current(true); // skip to next track on error
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [mounted]); // Run when mounted

  // Update video ID when track changes
  useEffect(() => {
    if (!mounted || !playerRef.current) return;

    // We are skipping to a new track, so reset saved time to 0
    localStorage.setItem('showerHour:currentTime', '0');

    if (playing || autoPlayNext) {
      if (playerRef.current.loadVideoById) playerRef.current.loadVideoById(currentTrack.videoId);
      setAutoPlayNext(false);
    } else {
      if (playerRef.current.cueVideoById) playerRef.current.cueVideoById(currentTrack.videoId);
    }
  }, [trackIndex, currentTrack.videoId, mounted]); // do NOT include 'playing' to prevent infinite updates

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handlePrev = () => {
    setTrackIndex((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleSeek = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const glassClasses = "border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] backdrop-blur-3xl backdrop-saturate-[1.7] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]";

  return (
    <div className={`relative w-full max-w-[720px] mx-auto flex justify-center mb-8 px-4 sm:px-6 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Vinyl artwork container - now absolutely positioned relative to the outer wrapper so it snaps perfectly inside the glass pill */}
      <div 
        className={`absolute z-20 overflow-hidden rounded-full pointer-events-auto shadow-md motion-safe:animate-[spin_8s_linear_infinite] bg-gradient-to-tr from-[#1a1a1a] via-[#2a2a2a] to-[#111] ring-1 ring-white/10
        /* Mobile position */
        left-8 top-4 w-[56px] h-[56px]
        /* Desktop position */
        sm:left-9 sm:top-1/2 sm:-translate-y-1/2 sm:w-[64px] sm:h-[64px]
        `}
        style={{ animationPlayState: playing ? 'running' : 'paused' }}
      >
        {/* Track poster (YouTube thumbnail) */}
        {thumbQuality !== 'none' && (
          <img 
            src={`https://img.youtube.com/vi/${currentTrack.videoId}/${thumbQuality}.jpg`}
            alt={currentTrack.title}
            onError={() => {
              if (thumbQuality === 'maxresdefault') setThumbQuality('hqdefault');
              else if (thumbQuality === 'hqdefault') setThumbQuality('none');
            }}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        
        {/* Subtle vinyl grooves */}
        <div className="absolute inset-0 rounded-full border-[4px] border-white/5 m-1 pointer-events-none" />
        <div className="absolute inset-0 rounded-full border-[2px] border-white/5 m-3 pointer-events-none" />
        
        {/* The YouTube iframe (hidden, audio only) */}
        <div id="youtube-player" className="w-full h-full absolute top-0 left-0 pointer-events-none opacity-0" />
        {/* Spindle hole */}
        <div className="absolute top-1/2 left-1/2 w-[12px] h-[12px] -mt-[6px] -ml-[6px] bg-black/70 ring-2 ring-white/40 rounded-full z-20 shadow-inner" />
      </div>

      {/* --- DESKTOP UI --- */}
      <div className={`hidden sm:flex items-center w-full rounded-full p-2.5 pr-6 ${glassClasses}`}>
        {/* Placeholder for absolute vinyl */}
        <div className="w-[64px] h-[64px] ml-1.5 mr-5 shrink-0" />
        
        <div className="flex flex-col justify-center flex-1 min-w-0 mr-6">
          <div className="text-[16px] font-semibold truncate text-white">{currentTrack.title}</div>
          <div className="text-[13px] text-white/70 truncate mt-[2px]">{currentTrack.artist}</div>
          
          {/* Seek bar */}
          <div 
            className="h-[20px] flex items-center cursor-pointer group touch-none relative mt-1"
            onPointerDown={handleSeek}
          >
            <div className="w-full h-[4px] bg-white/20 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <div className="text-[11px] tabular-nums text-white/60 mt-0.5 tracking-wide">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ShuffleButton active={shuffle} onClick={() => setShuffle(!shuffle)} />
          <PrevButton onClick={handlePrev} />
          <PlayButton playing={playing} onToggle={handleTogglePlay} size="large" />
          <NextButton onClick={handleNext} />
          <PlaylistButton onClick={() => setShowPlaylist(!showPlaylist)} />
        </div>
      </div>

      {/* --- MOBILE UI --- */}
      <div className={`flex sm:hidden flex-col w-full rounded-[26px] p-4 ${glassClasses}`}>
        {/* Row 1: 56px placeholder + title/artist */}
        <div className="flex items-center mb-4">
          <div className="w-[56px] h-[56px] shrink-0 mr-4" /> {/* Placeholder for absolute vinyl */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-[15px] font-semibold truncate text-white">{currentTrack.title}</div>
            <div className="text-[12.5px] text-white/70 truncate">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Row 2: Seek bar */}
        <div 
          className="h-[24px] w-full flex items-center cursor-pointer group touch-none relative mb-2"
          onPointerDown={handleSeek}
        >
          <div className="w-full h-[3px] bg-white/15 rounded-full relative overflow-visible">
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full opacity-90 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Row 3: Time and Transport */}
        <div className="flex items-center justify-between relative h-[52px]">
          <div className="text-[10.5px] tabular-nums text-white/50 flex flex-col absolute left-0">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <div className="flex items-center gap-0.5 sm:gap-2 mx-auto pl-8 pr-1">
            <ShuffleButton active={shuffle} onClick={() => setShuffle(!shuffle)} />
            <PrevButton onClick={handlePrev} />
            <PlayButton playing={playing} onToggle={handleTogglePlay} size="large" />
            <NextButton onClick={handleNext} />
            <PlaylistButton onClick={() => setShowPlaylist(!showPlaylist)} />
          </div>
        </div>
      </div>

      {/* --- PLAYLIST QUEUE POPOVER --- */}
      {showPlaylist && (
        <div className={`absolute bottom-full right-4 sm:right-6 mb-4 w-[calc(100%-32px)] sm:w-[350px] max-h-[50vh] overflow-y-auto rounded-[26px] p-4 ${glassClasses} z-50 flex flex-col gap-1 border-t border-l border-white/20 custom-scrollbar`}>
           <div className="text-white font-semibold mb-3 px-2 flex justify-between items-center sticky top-0 bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/10 z-10">
             <span>Queue ({playlist.length} tracks)</span>
             <button onClick={() => setShowPlaylist(false)} className="text-white/60 hover:text-white p-1">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           </div>
           {playlist.map((track, i) => (
             <button
               key={track.id}
               onClick={() => {
                 setTrackIndex(i);
                 setShowPlaylist(false);
               }}
               className={`flex flex-col items-start px-4 py-3 rounded-xl transition-colors shrink-0 ${
                 i === trackIndex ? 'bg-white/20 border border-white/10' : 'hover:bg-white/10 border border-transparent'
               }`}
             >
               <span className={`text-[14px] truncate w-full text-left font-medium ${i === trackIndex ? 'text-white' : 'text-white/90'}`}>{track.title}</span>
               <span className={`text-[12px] truncate w-full text-left mt-0.5 ${i === trackIndex ? 'text-white/80' : 'text-white/50'}`}>{track.artist}</span>
             </button>
           ))}
        </div>
      )}
    </div>
  );
}
