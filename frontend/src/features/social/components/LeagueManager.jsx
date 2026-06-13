import React, { useState } from 'react';
import { Users, X, Trophy } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { leagueService } from '../../../services/firebase/leagueService';
import { STYLES } from '../../../config/theme';
import { showToast } from '../../../utils/toast';

export default function LeagueManager({ onLeagueAdded, compactMode }) {
  const { userData } = useUserStore();
  const [modalType, setModalType] = useState(null); // 'create' or 'join'
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!userData || !userData.uid) {
      showToast('error', 'กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);
    let result;
    
    if (modalType === 'create') {
      result = await leagueService.createLeague(userData, inputValue);
      if (result.success) {
        showToast('success', `สร้างลีกสำเร็จ! รหัสเข้าร่วมคือ ${result.code}`);
      }
    } else if (modalType === 'join') {
      result = await leagueService.joinLeague(userData, inputValue);
      if (result.success) {
        showToast('success', `เข้าร่วมลีก ${result.leagueName} สำเร็จ!`);
      }
    }

    if (result && result.success) {
      setModalType(null);
      setInputValue('');
      if (onLeagueAdded) onLeagueAdded();
    } else if (result) {
      showToast('error', result.message);
    }
    
    setLoading(false);
  };

  return (
    <>
      {compactMode ? (
        <div className="flex gap-2 justify-between items-center mb-2 px-2 mt-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" /> ลีกของคุณ
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => { setModalType('create'); setInputValue(''); }}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              + สร้างลีก
            </button>
            <button 
              onClick={() => { setModalType('join'); setInputValue(''); }}
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
                onClick={() => { setModalType('create'); setInputValue(''); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                สร้างลีกใหม่
              </button>
              <button 
                onClick={() => { setModalType('join'); setInputValue(''); }}
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
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"
            >
              <X size={16} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              {modalType === 'create' ? '🏆 สร้างลีกใหม่' : '🤝 เข้าร่วมลีก'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                {modalType === 'create' ? 'ชื่อลีกของคุณ' : 'รหัสลีก 6 หลัก'}
              </label>
              <input
                type="text"
                placeholder={modalType === 'create' ? "เช่น เพื่อนกันมันส์ฮา" : "เช่น AB12CD"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={modalType === 'create' ? 30 : 6}
                disabled={loading}
              />
            </div>

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
