import React, { useState, useEffect } from 'react';
import { Trophy, X, Settings, LogOut, Trash2, Edit3, Save, Copy, CheckCircle } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { leagueService } from '../../../services/firebase/leagueService';
import { showToast } from '../../../utils/toast';

export default function LeagueDetailsModal({ league, onClose, onLeagueUpdated }) {
  const { userData } = useUserStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // สำหรับแก้ชื่อลีก
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(league.name);
  const [actionLoading, setActionLoading] = useState(false);

  const isCreator = userData?.uid === league.creatorId;

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const data = await leagueService.getLeagueMembersData(league.members || []);
      // เพิ่ม rank ให้แต่ละคน
      const rankedData = data.map((m, index) => ({ ...m, rank: index + 1 }));
      setMembers(rankedData);
      setLoading(false);
    };
    if (league && league.members) {
      fetchMembers();
    }
  }, [league]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(league.code).then(() => {
      setCopied(true);
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === league.name) {
      setIsEditing(false);
      return;
    }
    setActionLoading(true);
    const result = await leagueService.updateLeagueName(league.id, editName);
    if (result.success) {
      showToast('success', 'เปลี่ยนชื่อลีกสำเร็จ');
      setIsEditing(false);
      onLeagueUpdated();
    } else {
      showToast('error', result.message);
    }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!window.confirm('คุณต้องการออกจากลีกนี้ใช่หรือไม่?')) return;
    setActionLoading(true);
    const result = await leagueService.leaveLeague(league.id, userData.uid);
    if (result.success) {
      showToast('success', 'ออกจากลีกสำเร็จ');
      onLeagueUpdated();
      onClose();
    } else {
      showToast('error', result.message);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('คุณต้องการ "ลบลีก" นี้ทิ้งถาวรใช่หรือไม่?\n(ข้อมูลทั้งหมดจะถูกลบ ไม่สามารถกู้คืนได้)')) return;
    setActionLoading(true);
    const result = await leagueService.deleteLeague(league.id);
    if (result.success) {
      showToast('success', 'ลบลีกสำเร็จ');
      onLeagueUpdated();
      onClose();
    } else {
      showToast('error', result.message);
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-5 border-b border-slate-100 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1.5 shadow-sm"
          >
            <X size={18} />
          </button>
          
          <div className="flex justify-between items-start pr-8">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2 items-center mb-1">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border border-indigo-200 rounded px-2 py-1 text-lg font-bold text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={actionLoading} className="text-emerald-600 bg-emerald-50 p-1.5 rounded hover:bg-emerald-100">
                    <Save size={18} />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditName(league.name); }} className="text-slate-500 bg-slate-100 p-1.5 rounded hover:bg-slate-200">
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <h3 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
                  <Trophy size={20} className="text-amber-500" /> {league.name}
                </h3>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={handleCopyCode}
                  className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  รหัส: {league.code}
                </button>
                <span className="text-xs text-slate-400 font-medium bg-slate-200/50 px-2 py-1 rounded">
                  {members.length} สมาชิก
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Toggle (Leaderboard / Settings) */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button 
            onClick={() => setShowSettings(false)}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${!showSettings ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            ตารางคะแนน
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-1 transition-colors ${showSettings ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings size={16} /> ตั้งค่าลีก
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar bg-slate-50/50">
          {!showSettings ? (
            // --- Leaderboard View ---
            loading ? (
              <div className="text-center py-10 text-slate-400 animate-pulse font-medium">กำลังโหลดอันดับ...</div>
            ) : (
              <div className="space-y-2">
                {members.map((m) => {
                  const isMe = m.id === userData?.uid;
                  return (
                    <div key={m.id} className={`flex items-center p-3 rounded-xl border ${isMe ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white'}`}>
                      <div className="w-8 font-black text-center text-slate-400">{m.rank}</div>
                      <div className="flex-1 px-3 flex items-center gap-2 overflow-hidden">
                        {m.photoURL && <img src={m.photoURL} alt="" className="w-6 h-6 rounded-full" />}
                        <span className={`font-bold text-sm truncate ${isMe ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {m.teamName || m.displayName || 'ไม่มีชื่อทีม'}
                        </span>
                        {isMe && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">คุณ</span>}
                      </div>
                      <div className="text-right">
                        <span className={`font-black text-base ${isMe ? 'text-indigo-600' : 'text-slate-700'}`}>{m.userPoints || 0}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">Pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // --- Settings View ---
            <div className="space-y-4 py-2">
              {isCreator ? (
                <>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2"><Edit3 size={16} className="text-indigo-500" /> แก้ไขชื่อลีก</h4>
                    <p className="text-xs text-slate-500 mb-3">คุณสามารถเปลี่ยนชื่อลีกได้ตลอดเวลา</p>
                    <button 
                      onClick={() => { setIsEditing(true); setShowSettings(false); }}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      เปลี่ยนชื่อลีก
                    </button>
                  </div>
                  
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-6">
                    <h4 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2"><Trash2 size={16} /> ลบลีก (Danger Zone)</h4>
                    <p className="text-xs text-red-500/80 mb-3">หากลบลีกแล้วจะไม่สามารถกู้คืนได้ และสมาชิกทุกคนจะถูกเตะออก</p>
                    <button 
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
                    >
                      {actionLoading ? 'กำลังดำเนินการ...' : 'ลบลีกทิ้งถาวร'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2"><LogOut size={16} className="text-orange-500" /> ออกจากลีก</h4>
                  <p className="text-xs text-slate-500 mb-3">หากคุณออกจากลีก คุณต้องขอรหัสจากหัวหน้าลีกเพื่อเข้าใหม่</p>
                  <button 
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {actionLoading ? 'กำลังดำเนินการ...' : 'ออกจากลีก'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
