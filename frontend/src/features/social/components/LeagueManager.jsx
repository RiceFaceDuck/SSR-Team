import React from 'react';
import { Users, X, Trophy } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { STYLES } from '../../../config/theme';
import { useLeagueForm } from '../hooks/useLeagueForm';

export default function LeagueManager({ onLeagueAdded, compactMode }) {
  const { userData } = useUserStore();
  const {
    modalType,
    inputValue,
    setInputValue,
    loading,
    mode,
    setMode,
    customRules,
    setCustomRules,
    openModal,
    closeModal,
    handleAction
  } = useLeagueForm(userData, onLeagueAdded);

  return (
    <>
      {compactMode ? (
        <div className="flex gap-2 justify-between items-center mb-2 px-2 mt-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" /> ลีกของคุณ
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => openModal('create')}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              + สร้างลีก
            </button>
            <button 
              onClick={() => openModal('join')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              🔑 เข้าร่วม
            </button>
          </div>
        </div>
      ) : (
        <div className={STYLES.card}>
          <div className="text-center py-6 text-slate-500">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">จัดการลีกส่วนตัวของคุณ</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button 
                onClick={() => openModal('create')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                สร้างลีกใหม่
              </button>
              <button 
                onClick={() => openModal('join')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                เข้าร่วมด้วยรหัส
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Create/Join */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              {modalType === 'create' ? '🏆 สร้างลีกใหม่' : '🤝 เข้าร่วมลีก'}
            </h3>
            
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                {modalType === 'create' ? 'ชื่อลีก/การดวลของคุณ' : 'รหัสลีก 6 หลัก'}
              </label>
              <input
                type="text"
                placeholder={modalType === 'create' ? "เช่น เพื่อนกันมันส์ฮา" : "เช่น AB12CD"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                maxLength={modalType === 'create' ? 30 : 6}
                disabled={loading}
              />

              {modalType === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">โหมดการแข่งขัน</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setMode('classic')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'classic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        Classic (สะสมแต้ม)
                      </button>
                      <button 
                        onClick={() => setMode('duel')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'duel' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        Duel (ดวลตัวต่อตัว)
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 border-b border-slate-200 pb-1">ตั้งค่ากติกาพิเศษ (Custom Rules)</h4>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">ตัวคูณกัปตันทีม</span>
                      <select 
                        value={customRules.captainMultiplier} 
                        onChange={(e) => setCustomRules({...customRules, captainMultiplier: Number(e.target.value)})}
                        className="bg-white border border-slate-300 rounded text-xs px-2 py-1"
                      >
                        <option value="1">x1 (ไม่คูณ)</option>
                        <option value="1.5">x1.5</option>
                        <option value="2">x2</option>
                        <option value="3">x3</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">คะแนนการยิงประตู</span>
                      <input 
                        type="number" 
                        value={customRules.goal} 
                        onChange={(e) => setCustomRules({...customRules, goal: Number(e.target.value)})}
                        className="w-16 bg-white border border-slate-300 rounded text-xs px-2 py-1 text-right"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">คะแนนแอสซิสต์</span>
                      <input 
                        type="number" 
                        value={customRules.assist} 
                        onChange={(e) => setCustomRules({...customRules, assist: Number(e.target.value)})}
                        className="w-16 bg-white border border-slate-300 rounded text-xs px-2 py-1 text-right"
                      />
                    </div>
                  </div>
                </div>
              )}

            <button
              onClick={handleAction}
              disabled={loading || !inputValue.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
