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
    }, 5000);

    // Set interval for every 5 minutes (300,000 ms)
    const intervalTimer = setInterval(() => {
      if (!document.fullscreenElement) {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
      }
    }, 300000);

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
    <div className="absolute top-2 right-2 z-50 flex items-start justify-end pointer-events-auto">
      
      {/* Tooltip */}
      <div 
        className={`mr-3 mt-1 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg border border-[#fbbf24] transition-all duration-500 ease-out origin-right ${
          showTooltip && !isFullscreen ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
        }`}
      >
        <div className="relative">
          💡 มีฟังก์ชั่น Full screen อยู่ตรงนี้!
          {/* Arrow pointing to the button */}
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 border-8 border-transparent border-l-white/90"></div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={toggleFullscreen}
        className="w-10 h-10 bg-[#1e293b]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-slate-600/50 text-white hover:bg-[#fbbf24] hover:text-[#1e293b] hover:border-[#fbbf24] transition-all duration-300 shadow-md active-press hover-lift"
        aria-label="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
      </button>

    </div>
  );
}
