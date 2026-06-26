import React, { useState, useEffect, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check initial fullscreen state and listen for changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      if (isCurrentlyFullscreen) {
        setShowTooltip(false); // Hide tooltip when entering fullscreen
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Tooltip logic
  useEffect(() => {
    if (isFullscreen) return;

    // Show initially
    setShowTooltip(true);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000); // Show for 6 seconds

    // Set interval to remind frequently (every 30 seconds)
    const intervalTimer = setInterval(() => {
      if (!document.fullscreenElement) {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
        }, 6000);
      }
    }, 30000);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(intervalTimer);
    };
  }, [isFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    }
  }, []);

  return (
    <div className="absolute top-3 right-3 z-50 flex items-start justify-end pointer-events-auto">
      {/* Tooltip */}
      <div
        className={`relative mr-4 my-auto max-w-[240px] sm:max-w-[300px] bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl shadow-[0_0_25px_rgba(168,85,247,0.8)] border-2 border-white/50 transition-all duration-700 ease-in-out origin-right flex items-center ${
          showTooltip && !isFullscreen
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-90 translate-x-8 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-lg sm:text-xl flex-shrink-0 animate-pulse">✨</span>
          <span className="leading-tight text-center">
            ขยายเต็มจอได้ที่นี่
            <br />
            เพื่อเพิ่มอรรถรสในการเล่น!
          </span>
          <span className="text-lg sm:text-xl flex-shrink-0 animate-pulse">🤩</span>
        </div>
        {/* Arrow pointing to the button */}
        <div className="absolute top-1/2 -right-[17px] -translate-y-1/2 border-[8px] border-transparent border-l-white/50"></div>
        <div className="absolute top-1/2 -right-[13px] -translate-y-1/2 border-[7px] border-transparent border-l-fuchsia-600"></div>
      </div>

      {/* Button */}
      <button
        onClick={toggleFullscreen}
        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xl active-press hover-lift ${
          isFullscreen
            ? 'bg-[#1e293b]/80 backdrop-blur-md border-slate-600/50 text-white hover:bg-slate-700'
            : 'bg-gradient-to-br from-amber-400 to-orange-500 border-white text-white hover:from-orange-500 hover:to-amber-400 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]'
        }`}
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? (
          <Minimize size={24} strokeWidth={2.5} />
        ) : (
          <Maximize size={24} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
