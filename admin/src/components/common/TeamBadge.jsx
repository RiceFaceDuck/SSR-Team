import React from 'react';

const TEAM_COLORS_BY_NAME = {
  Arsenal: { primary: '#EF0107', secondary: '#063672', code: 'ARS' },
  'Aston Villa': { primary: '#670E36', secondary: '#95BFE5', code: 'AVL' },
  'AFC Bournemouth': { primary: '#DA291C', secondary: '#000000', code: 'BOU' },
  Bournemouth: { primary: '#DA291C', secondary: '#000000', code: 'BOU' },
  Brentford: { primary: '#E30613', secondary: '#000000', code: 'BRE' },
  'Brighton & Hove Albion': { primary: '#0057B8', secondary: '#FFFFFF', code: 'BHA' },
  Brighton: { primary: '#0057B8', secondary: '#FFFFFF', code: 'BHA' },
  Chelsea: { primary: '#034694', secondary: '#C4CBD4', code: 'CHE' },
  'Coventry City': { primary: '#00BFFF', secondary: '#000080', code: 'COV' },
  'Crystal Palace': { primary: '#1B458F', secondary: '#C4122E', code: 'CRY' },
  Everton: { primary: '#003399', secondary: '#FFFFFF', code: 'EVE' },
  Fulham: { primary: '#FFFFFF', secondary: '#000000', code: 'FUL' },
  'Hull City': { primary: '#F5A122', secondary: '#000000', code: 'HUL' },
  'Ipswich Town': { primary: '#0000FF', secondary: '#FFFFFF', code: 'IPS' },
  'Leeds United': { primary: '#FFCD00', secondary: '#1D428A', code: 'LEE' },
  Liverpool: { primary: '#C8102E', secondary: '#00B2A9', code: 'LIV' },
  'Manchester City': { primary: '#6CABDD', secondary: '#1C2C5B', code: 'MCI' },
  'Manchester United': { primary: '#DA291C', secondary: '#FBE122', code: 'MUN' },
  'Newcastle United': { primary: '#000000', secondary: '#FFFFFF', code: 'NEW' },
  Newcastle: { primary: '#000000', secondary: '#FFFFFF', code: 'NEW' },
  'Nottingham Forest': { primary: '#E53233', secondary: '#FFFFFF', code: 'NFO' },
  Sunderland: { primary: '#FF0000', secondary: '#FFFFFF', code: 'SUN' },
  'Tottenham Hotspur': { primary: '#132257', secondary: '#FFFFFF', code: 'TOT' },
  Tottenham: { primary: '#132257', secondary: '#FFFFFF', code: 'TOT' },
};

export const getTeamInfo = (name, shortName) => {
  if (!name) return { primary: '#333', secondary: '#666', code: '???' };

  const exactMatch = TEAM_COLORS_BY_NAME[name];
  if (exactMatch) return exactMatch;

  if (shortName) {
    const byCode = Object.values(TEAM_COLORS_BY_NAME).find(
      (t) => t.code === shortName?.toUpperCase()
    );
    if (byCode) return byCode;
  }

  return {
    primary: '#333333',
    secondary: '#888888',
    code: shortName ? shortName.toUpperCase() : name.substring(0, 3).toUpperCase(),
  };
};

export default function TeamBadge({
  teamName,
  shortName,
  size = 'md',
  className = '',
  showText = true,
}) {
  const teamInfo = getTeamInfo(teamName, shortName);

  // Size mapping
  const sizeStyles = {
    sm: 'w-6 h-7 text-[8px] rounded-[4px_4px_10px_10px] border',
    md: 'w-8 h-10 text-[10px] rounded-[6px_6px_14px_14px] border-[1.5px]',
    lg: 'w-12 h-14 text-sm rounded-[8px_8px_20px_20px] border-2',
    xl: 'w-16 h-20 text-lg rounded-[12px_12px_28px_28px] border-2',
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_0_8px_rgba(0,0,0,0.3)] border-[#D4AF37] shrink-0 ${currentSize} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${teamInfo.primary} 45%, ${teamInfo.secondary})`,
      }}
    >
      {/* Shine effect */}
      <div
        className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
          transform: 'rotate(45deg) translateY(-10%)',
        }}
      />

      {/* Text */}
      {showText && (
        <span
          className="font-black text-white tracking-wide z-10 font-sans"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {teamInfo.code}
        </span>
      )}
    </div>
  );
}
