import React from 'react';
import { ShoppingCart, User, X } from 'lucide-react';

const ManagerHeader = ({ balls, activeTab, setActiveTab, onClose, ownedCount }) => {
  return (
    <div className="p-4 border-b border-[#1e3a8a] bg-[#0f284e]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
          <span className="text-[#3b82f6]">MANAGER</span> CENTER
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-[#040f1d] px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-2">
            <span className="text-amber-500 text-xs font-bold">🪙</span>
            <span className="text-amber-400 font-bold">{balls} Balls</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5">
            <X size={20} />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 bg-[#040f1d] p-1 rounded-lg">
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`flex-1 py-2 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <User size={16} /> คลังของคุณ ({ownedCount})
        </button>
        <button 
          onClick={() => setActiveTab('SHOP')}
          className={`flex-1 py-2 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'SHOP' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingCart size={16} /> ร้านค้าผู้จัดการทีม
        </button>
      </div>
    </div>
  );
};

export default ManagerHeader;
