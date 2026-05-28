import React from 'react';
import { LayoutDashboard, ChevronDown, Info } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { getAllFormations, getFormationData } from '../../utils/formationUtils';
import { toast } from '../../utils/toast';

export default function FormationSelector() {
  // ดึงค่าแผนปัจจุบันและฟังก์ชันเปลี่ยนแผนจาก Store
  const { formation, setFormation } = useUserStore();
  
  // ดึงข้อมูลแผนการเล่นทั้งหมดจาก Registry
  const formations = getAllFormations();
  
  // ดึงข้อมูลรายละเอียดของแผนที่กำลังเลือกอยู่ปัจจุบัน เพื่อแสดงคำอธิบาย
  const currentFormationData = getFormationData(formation);

  // ฟังก์ชันจัดการเมื่อผู้เล่นเปลี่ยนแผนการเล่น
  const handleFormationChange = (e) => {
    const newFormationId = e.target.value;
    if (newFormationId !== formation) {
      setFormation(newFormationId);
      
      // แจ้งเตือนผู้เล่น การเปลี่ยนแผนอาจทำให้นักเตะบางคนถูกเตะกลับม้านั่ง (Logic อยู่ใน Store)
      if (toast && toast.info) {
        toast.info(`เปลี่ยนเป็นแผน ${newFormationId} (ระบบจัดระเบียบนักเตะอัตโนมัติ)`);
      }
    }
  };

  return (
    // ปรับ UI เป็น Premium Glassmorphism ให้เข้ากับธีมสนาม (Dark Mode)
    <div className="bg-slate-900/70 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] 
                    border border-slate-700/50 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 z-20 relative">
      
      {/* ส่วนหัวข้อและคำอธิบายแผนปัจจุบัน */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-400 mt-0.5 hidden sm:block">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            แผนการเล่น <span className="text-indigo-400">({currentFormationData.name})</span>
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
            <Info size={12} className="text-slate-500" />
            <span className="text-cyan-400 font-semibold">{currentFormationData.style}:</span> 
            <span className="hidden sm:inline"> {currentFormationData.description}</span>
          </p>
        </div>
      </div>

      {/* ส่วน Dropdown เลือกแผนการเล่น */}
      <div className="relative w-full sm:w-auto min-w-[140px]">
        <select 
          value={formation}
          onChange={handleFormationChange}
          className="w-full bg-slate-800 text-cyan-300 text-sm rounded-xl pl-4 pr-10 py-2.5 font-black 
                     outline-none border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 
                     transition-all cursor-pointer appearance-none shadow-inner"
        >
          {/* เรนเดอร์ตัวเลือกจากข้อมูลใน Utils อัตโนมัติ */}
          {formations.map((fmt) => (
            <option key={fmt.id} value={fmt.id} className="bg-slate-800 text-slate-200">
              {fmt.id} - {fmt.style}
            </option>
          ))}
        </select>
        
        {/* Custom Arrow Icon ซ้อนทับลูกศรเดิมของ Browser */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-500">
          <ChevronDown size={18} />
        </div>
      </div>
      
    </div>
  );
}