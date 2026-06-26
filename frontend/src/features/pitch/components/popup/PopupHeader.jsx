import React from 'react';
import { X } from 'lucide-react';
import { formatPlayerName, formatTeamShortName } from '../../../../utils/formatters';

const PopupHeader = ({ player, onClose }) => {
  return (
    <div className="relative pt-5 pb-4 px-4 flex flex-col items-center bg-gradient-to-b from-slate-50 to-white">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
      >
        <X size={16} />
      </button>

      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#fbbf24] to-[#d97706] rounded-full p-[3px] shadow-lg mb-2">
        <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white relative">
          <img
            src={
              player.fullData?.imageUrl ||
              'https://ui-avatars.com/api/?background=random&color=fff&name=' + player.name
            }
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h2 className="text-lg font-black text-slate-800 mt-2 mb-1">
        {formatPlayerName(player.name)}
      </h2>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-sm">
          {player.position}
        </span>
        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-sm border border-slate-300">
          {formatTeamShortName(player.team)}
        </span>
      </div>
    </div>
  );
};

export default PopupHeader;
