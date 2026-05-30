import React from 'react';
import { LayoutDashboard, ChevronDown } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { getAllFormations } from '../../utils/formationUtils';
import { toast } from '../../utils/toast';

export default function FormationSelector() {
  const { formation, setFormation } = useUserStore();
  const formations = getAllFormations();

  const handleFormationChange = (e) => {
    const newFormationId = e.target.value;
    if (newFormationId !== formation) {
      setFormation(newFormationId);
      if (toast && toast.info) {
        toast.info(`เปลี่ยนแผนเป็น ${newFormationId}`);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center z-20 group">
      {/* 🌟 Glow Effect เมื่อ Hover */}
      <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full group-hover:bg-blue-500/30 transition-all opacity-0 group-hover:opacity-100 pointer-events-none"></div>
      
      {/* 🌟 แคปซูลหลัก (Compact Pill) */}
      <div className="relative flex items-center bg-slate-900/95 border border-slate-700 hover:border-blue-500/50 rounded-full pl-3 pr-1 py-1 backdrop-blur-md shadow-lg transition-all">
        <LayoutDashboard size={14} className="text-blue-400 mr-2 opacity-90" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1 hidden sm:inline">แผน:</span>
        
        <div className="relative flex items-center">
          <select 
            value={formation}
            onChange={handleFormationChange}
            className="appearance-none bg-transparent text-white text-xs sm:text-sm font-black pl-1 pr-6 py-0.5 outline-none cursor-pointer z-10 relative drop-shadow-md tracking-wider"
          >
            {formations.map((fmt) => (
              <option key={fmt.id} value={fmt.id} className="bg-slate-900 text-slate-200 font-bold tracking-widest">
                {fmt.id}
              </option>
            ))}
          </select>
          
          {/* Custom Arrow Icon */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-blue-400 transition-colors">
            <ChevronDown size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
}