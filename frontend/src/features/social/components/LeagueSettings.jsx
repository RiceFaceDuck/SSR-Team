import { Edit3, Trash2, LogOut, Settings2, Trophy } from 'lucide-react';

export default function LeagueSettings({ 
  league,
  isCreator, 
  setIsEditing, 
  setShowSettings, 
  handleDelete, 
  handleLeave, 
  actionLoading 
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Settings2 size={16} className="text-indigo-500" /> ข้อมูลลีกและกติกา
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">โหมดการแข่งขัน</span>
            <span className={`font-black uppercase ${league?.mode === 'duel' ? 'text-amber-500' : 'text-indigo-600'}`}>
              {league?.mode === 'duel' ? 'Duel (ดวล)' : 'Classic'}
            </span>
          </div>
          {league?.customRules && Object.keys(league.customRules).length > 0 && (
            <>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="text-slate-500 font-bold">กัปตันคูณ</span>
                <span className="text-slate-800 font-bold">x{league.customRules.captainMultiplier || 2}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="text-slate-500 font-bold">คะแนนประตู</span>
                <span className="text-slate-800 font-bold">{league.customRules.goal || 800} Pts</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                <span className="text-slate-500 font-bold">คะแนนแอสซิสต์</span>
                <span className="text-slate-800 font-bold">{league.customRules.assist || 600} Pts</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isCreator ? (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Edit3 size={16} className="text-indigo-500" /> แก้ไขชื่อลีก
            </h4>
            <p className="text-xs text-slate-500 mb-3">คุณสามารถเปลี่ยนชื่อลีกได้ตลอดเวลา</p>
            <button 
              onClick={() => { setIsEditing(true); setShowSettings(false); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              เปลี่ยนชื่อลีก
            </button>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-6">
            <h4 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
              <Trash2 size={16} /> ลบลีก (Danger Zone)
            </h4>
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
          <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
            <LogOut size={16} className="text-orange-500" /> ออกจากลีก
          </h4>
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
  );
}
