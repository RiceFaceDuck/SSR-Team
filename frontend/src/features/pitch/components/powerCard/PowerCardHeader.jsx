import React from 'react';
import { Archive, ShoppingCart, X } from 'lucide-react';

const PowerCardHeader = ({ balls, activeTab, setActiveTab, onClose, playerName }) => {
  return (
    <div className="p-4 border-b border-purple-500/20 bg-[#160d2b]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wider">
          <span className="text-purple-400">POWER</span> CARDS
        </h2>
        <div className="flex items-center gap-3">
          <div className="bg-[#040f1d] px-2 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
            <span className="text-amber-500 text-xs font-bold">🪙</span>
            <span className="text-amber-400 font-bold text-sm">{balls} Balls</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5">
            <X size={18} />
          </button>
        </div>
      </div>
      
      <p className="text-xs text-purple-300/60 mb-4 px-1">
        เลือกการ์ดเสริมพลังให้กับ <span className="font-bold text-white">{playerName || 'นักเตะ'}</span>
      </p>
      
      {/* Tabs */}
      <div className="flex gap-2 bg-[#040f1d] p-1 rounded-lg">
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-1.5 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Archive size={16} /> คลังการ์ด
        </button>
        <button 
          onClick={() => setActiveTab('SHOP')}
          className={`flex-1 py-1.5 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'SHOP' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingCart size={16} /> ร้านค้า
        </button>
      </div>
    </div>
  );
};

export default PowerCardHeader;
