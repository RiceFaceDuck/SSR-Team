import React from 'react';

export default function NormalMessageItem({ msg, isMe }) {
  // สีและสไตล์ตาม Club Tier
  let frameClass = 'bg-slate-100 border border-slate-200'; // Tier 1 or missing
  let nameClass = 'text-slate-400';

  if (msg.clubTier === 4) {
    frameClass =
      'bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]';
    nameClass = 'text-orange-500 font-black drop-shadow-sm';
  } else if (msg.clubTier === 3) {
    frameClass =
      'bg-gradient-to-br from-fuchsia-500 to-purple-600 border-2 border-fuchsia-300 shadow-[0_0_8px_rgba(192,38,211,0.4)]';
    nameClass = 'text-purple-500 font-bold';
  } else if (msg.clubTier === 2) {
    frameClass =
      'bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-300 shadow-[0_0_5px_rgba(59,130,246,0.3)]';
    nameClass = 'text-indigo-500 font-bold';
  }

  // ถ้าเป็น Super Chat ให้สีทองเด่นๆ ทับ
  const isSuper = msg.isSuperChat;
  if (isSuper) {
    frameClass =
      'bg-gradient-to-br from-amber-200 to-yellow-300 border-2 border-yellow-400 shadow-sm';
    nameClass = 'text-amber-500 font-black';
  }

  return (
    <div
      className={`flex w-full gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
    >
      {/* Avatar for others (Left) */}
      {!isMe && (
        <div className="relative shrink-0 w-9 h-9">
          <img
            src={msg.userPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.userId}
            alt="avatar"
            className={`w-9 h-9 rounded-full object-cover shrink-0 p-0.5 ${frameClass}`}
          />
          {/* Tier Indicator Icon */}
          {msg.clubTier >= 3 && !isSuper && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <span className="text-[10px] leading-none">{msg.clubTier === 4 ? '👑' : '⭐'}</span>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div
          className={`flex items-center gap-1.5 px-1 mb-0.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span className={`text-[10px] ${nameClass}`}>{msg.userName}</span>
          {msg.equippedTitle && (
            <span className="text-[8px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded-full uppercase shadow-sm whitespace-nowrap">
              {msg.equippedTitle}
            </span>
          )}
        </div>
        <div
          className={`px-3 py-2 text-sm break-words w-fit ${
            isSuper
              ? 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-950 font-bold border border-yellow-400 shadow-sm'
              : isMe
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-100 text-slate-800 shadow-sm'
          } ${isMe ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
        >
          {msg.text}
        </div>
      </div>

      {/* Avatar for me (Right) */}
      {isMe && (
        <div className="relative shrink-0 w-9 h-9">
          <img
            src={msg.userPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.userId}
            alt="avatar"
            className={`w-9 h-9 rounded-full object-cover shrink-0 p-0.5 ${frameClass}`}
          />
          {/* Tier Indicator Icon */}
          {msg.clubTier >= 3 && !isSuper && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <span className="text-[10px] leading-none">{msg.clubTier === 4 ? '👑' : '⭐'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
