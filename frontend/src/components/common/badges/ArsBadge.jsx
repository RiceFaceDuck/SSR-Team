import React from 'react';

export default function ArsBadge({ size = 'md', className = '', showText = true }) {
  const sizeStyles = {
    sm: 'w-6 h-7 text-[8px] rounded-[4px_4px_10px_10px] border border-[#FFD700]',
    md: 'w-8 h-10 text-[10px] rounded-[6px_6px_14px_14px] border-[1.5px] border-[#FFD700]',
    lg: 'w-12 h-14 text-sm rounded-[8px_8px_20px_20px] border-2 border-[#FFD700]',
    xl: 'w-16 h-20 text-lg rounded-[12px_12px_28px_28px] border-2 border-[#FFD700]',
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#EF0107] via-[#a80004] to-[#4a0002] shadow-[0_0_8px_rgba(239,1,7,0.5)] shrink-0 ${currentSize} ${className} transition-transform hover:scale-110 cursor-pointer`}
    >
      {/* White Sleeves (Armor plating effect) */}
      <div className="absolute top-0 left-[-10%] w-[35%] h-full bg-gradient-to-r from-slate-100 to-slate-300 transform skew-x-[-20deg] shadow-[2px_0_5px_rgba(0,0,0,0.5)] border-r border-white/50"></div>
      <div className="absolute top-0 right-[-10%] w-[35%] h-full bg-gradient-to-l from-slate-100 to-slate-300 transform skew-x-[20deg] shadow-[-2px_0_5px_rgba(0,0,0,0.5)] border-l border-white/50"></div>

      {/* Abstract Cannon (Fantasy Weaponry) */}
      <div className="absolute z-0 w-[60%] h-[15%] bg-gradient-to-r from-[#FFD700] to-[#B8860B] rounded-[2px] transform -rotate-[15deg] translate-y-1 shadow-[0_0_5px_#FFD700]"></div>
      <div className="absolute z-0 w-[20%] aspect-square bg-gradient-to-br from-[#FFD700] to-[#8B6508] rounded-full left-[20%] bottom-[35%] border-[1px] border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.8)]"></div>

      {/* Inner Fire Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 to-transparent mix-blend-overlay"></div>

      {/* Glass/Shine effect */}
      <div className="absolute w-full h-[40%] top-0 left-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full"></div>

      {/* Text if needed */}
      {showText && (
        <span className="font-black text-white tracking-widest z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] font-sans">
          ARS
        </span>
      )}
    </div>
  );
}
