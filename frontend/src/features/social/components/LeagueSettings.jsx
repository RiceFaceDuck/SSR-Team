import { Edit3, Trash2, LogOut, Settings2, Trophy } from 'lucide-react';

export default function LeagueSettings({
  league,
  isCreator,
  setIsEditing,
  setShowSettings,
  handleDelete,
  handleLeave,
  actionLoading,
  editSettings,
  setEditSettings,
  handleSaveSettings,
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Settings2 size={16} className="text-indigo-500" /> ข้อมูลลีกและกติกา
        </h4>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">โหมดการแข่งขัน</span>
            {isCreator ? (
              <select
                value={editSettings?.mode || league?.mode || 'classic'}
                onChange={(e) => setEditSettings({ ...editSettings, mode: e.target.value })}
                className="bg-white border border-slate-300 rounded text-xs px-2 py-1 font-black uppercase text-indigo-600"
              >
                <option value="classic">Classic (สะสมแต้ม)</option>
                <option value="duel">Duel (ดวล)</option>
              </select>
            ) : (
              <span
                className={`font-black uppercase ${league?.mode === 'duel' ? 'text-amber-500' : 'text-indigo-600'}`}
              >
                {league?.mode === 'duel' ? 'Duel (ดวล)' : 'Classic'}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">เกณฑ์การจัดอันดับ</span>
            {isCreator ? (
              <select
                value={editSettings?.rankBy || league?.rankBy || 'userPoints'}
                onChange={(e) => setEditSettings({ ...editSettings, rankBy: e.target.value })}
                className="bg-white border border-slate-300 rounded text-xs px-2 py-1 font-bold text-slate-700"
              >
                <option value="userPoints">คะแนนรวมตลอดกาล (Total Points)</option>
                <option value="lastGameweekPoints">คะแนนประจำสัปดาห์ (Gameweek Points)</option>
              </select>
            ) : (
              <span className="font-bold text-slate-800">
                {league?.rankBy === 'lastGameweekPoints' ? 'คะแนนประจำสัปดาห์' : 'คะแนนรวมตลอดกาล'}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">กัปตันคูณ</span>
            {isCreator ? (
              <select
                value={
                  editSettings?.customRules?.captainMultiplier ||
                  league?.customRules?.captainMultiplier ||
                  2
                }
                onChange={(e) =>
                  setEditSettings({
                    ...editSettings,
                    customRules: {
                      ...editSettings.customRules,
                      captainMultiplier: Number(e.target.value),
                    },
                  })
                }
                className="bg-white border border-slate-300 rounded text-xs px-2 py-1"
              >
                <option value="1">x1 (ไม่คูณ)</option>
                <option value="1.5">x1.5</option>
                <option value="2">x2</option>
                <option value="3">x3</option>
              </select>
            ) : (
              <span className="text-slate-800 font-bold">
                x{league?.customRules?.captainMultiplier || 2}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">คะแนนประตู</span>
            {isCreator ? (
              <input
                type="number"
                value={editSettings?.customRules?.goal || league?.customRules?.goal || 800}
                onChange={(e) =>
                  setEditSettings({
                    ...editSettings,
                    customRules: { ...editSettings.customRules, goal: Number(e.target.value) },
                  })
                }
                className="w-20 bg-white border border-slate-300 rounded text-xs px-2 py-1 text-right font-bold"
              />
            ) : (
              <span className="text-slate-800 font-bold">
                {league?.customRules?.goal || 800} Pts
              </span>
            )}
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
            <span className="text-slate-500 font-bold">คะแนนแอสซิสต์</span>
            {isCreator ? (
              <input
                type="number"
                value={editSettings?.customRules?.assist || league?.customRules?.assist || 600}
                onChange={(e) =>
                  setEditSettings({
                    ...editSettings,
                    customRules: { ...editSettings.customRules, assist: Number(e.target.value) },
                  })
                }
                className="w-20 bg-white border border-slate-300 rounded text-xs px-2 py-1 text-right font-bold"
              />
            ) : (
              <span className="text-slate-800 font-bold">
                {league?.customRules?.assist || 600} Pts
              </span>
            )}
          </div>
        </div>

        {isCreator && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveSettings}
              disabled={actionLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              {actionLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าลีก'}
            </button>
          </div>
        )}
      </div>

      {isCreator ? (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Edit3 size={16} className="text-indigo-500" /> แก้ไขชื่อลีก
            </h4>
            <p className="text-xs text-slate-500 mb-3">คุณสามารถเปลี่ยนชื่อลีกได้ตลอดเวลา</p>
            <button
              onClick={() => {
                setIsEditing(true);
                setShowSettings(false);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm transition-colors"
            >
              เปลี่ยนชื่อลีก
            </button>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mt-6">
            <h4 className="font-bold text-red-700 text-sm mb-2 flex items-center gap-2">
              <Trash2 size={16} /> ลบลีก (Danger Zone)
            </h4>
            <p className="text-xs text-red-500/80 mb-3">
              หากลบลีกแล้วจะไม่สามารถกู้คืนได้ และสมาชิกทุกคนจะถูกเตะออก
            </p>
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
          <p className="text-xs text-slate-500 mb-3">
            หากคุณออกจากลีก คุณต้องขอรหัสจากหัวหน้าลีกเพื่อเข้าใหม่
          </p>
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
