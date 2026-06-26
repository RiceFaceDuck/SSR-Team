import React from 'react';
import PopupHeader from './popup/PopupHeader';
import PopupStats from './popup/PopupStats';
import PopupActions from './popup/PopupActions';

const PlayerActionPopup = ({ player, onClose, onAction }) => {
  if (!player) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-28 bg-slate-900/30 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* 🌟 Light Theme Popup Panel */}
      <div
        className="w-full max-w-[300px] bg-white rounded-[20px] shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header - Light Profile Section */}
        <PopupHeader player={player} onClose={onClose} />

        {/* Stats Bar */}
        <PopupStats player={player} />

        {/* Action Menu List */}
        <PopupActions player={player} onAction={onAction} />
      </div>
    </div>
  );
};

export default PlayerActionPopup;
