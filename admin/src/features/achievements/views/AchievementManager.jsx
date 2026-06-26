import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAchievementsAdmin } from '../hooks/useAchievementsAdmin';
import AchievementForm from '../components/AchievementForm';

export default function AchievementManager() {
  const { achievements, loading, saveAchievement, deleteAchievement } = useAchievementsAdmin();
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSave = async (data) => {
    const success = await saveAchievement(data);
    if (success) {
      setIsFormOpen(false);
      setEditingItem(null);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('คุณต้องการโหลดข้อมูลฉายาเริ่มต้น (Mock Data) เข้าสู่ระบบหรือไม่?')) return;
    const MOCK_ACHIEVEMENTS = [
      {
        id: 'achv_rookie',
        title: 'ROOKIE',
        desc: 'ลงทะเบียนเข้าสู่เกม (เด็กใหม่ไฟแรง)',
        iconType: 'Star',
        rarity: 'common',
        conditionType: 'none',
        conditionValue: 0,
        isActive: true,
      },
      {
        id: 'achv_millionaire',
        title: 'MILLIONAIRE',
        desc: 'มียอดเงินสะสมเกิน 1,000 Balls',
        iconType: 'Award',
        rarity: 'rare',
        conditionType: 'balls',
        conditionValue: 1000,
        isActive: true,
      },
      {
        id: 'achv_veteran',
        title: 'VETERAN',
        desc: 'ทำคะแนนรวมได้เกิน 5,000 Pts',
        iconType: 'Shield',
        rarity: 'epic',
        conditionType: 'userPoints',
        conditionValue: 5000,
        isActive: true,
      },
      {
        id: 'achv_mastermind',
        title: 'MASTERMIND',
        desc: 'ทำคะแนนสัปดาห์ล่าสุดเกิน 1,500 Pts',
        iconType: 'Trophy',
        rarity: 'legendary',
        conditionType: 'lastGameweekPoints',
        conditionValue: 1500,
        isActive: true,
      },
      {
        id: 'achv_president',
        title: 'PRESIDENT',
        desc: 'อัพเกรดสโมสรโดยใช้ EXP ไปแล้วมากกว่า 2,000',
        iconType: 'Crown',
        rarity: 'epic',
        conditionType: 'clubSpentExp',
        conditionValue: 2000,
        isActive: true,
      },
      {
        id: 'achv_architect',
        title: 'ARCHITECT',
        desc: 'อัพเกรดสนามแข่งจนถึงเลเวลสูงสุด (Lv.10)',
        iconType: 'Award',
        rarity: 'legendary',
        conditionType: 'stadiumLevel',
        conditionValue: 10,
        isActive: true,
      },
      {
        id: 'achv_onfire',
        title: 'ON FIRE',
        desc: 'ส่งทีมแข่งขันติดต่อกัน 3 สัปดาห์ขึ้นไป',
        iconType: 'Flame',
        rarity: 'rare',
        conditionType: 'streak',
        conditionValue: 3,
        isActive: true,
      },
      {
        id: 'achv_vip',
        title: 'VIP',
        desc: 'แอดมินผู้ดูแลระบบ',
        iconType: 'Crown',
        rarity: 'legendary',
        conditionType: 'admin',
        conditionValue: 0,
        isActive: true,
      },
    ];
    for (const achv of MOCK_ACHIEVEMENTS) {
      await saveAchievement(achv);
    }
    alert('โหลดข้อมูลสำเร็จ!');
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณต้องการลบฉายานี้หรือไม่?')) {
      await deleteAchievement(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Target className="text-blue-500" /> ความสำเร็จ & ฉายา
          </h2>
          <p className="text-slate-500 mt-1">ตั้งค่าเงื่อนไขการได้ฉายาสำหรับผู้เล่น</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeedData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            โหลดข้อมูล Mock Data
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={18} /> สร้างฉายาใหม่
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">
            {editingItem ? 'แก้ไขฉายา' : 'สร้างฉายาใหม่'}
          </h3>
          <AchievementForm
            initialData={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-bold">ชื่อฉายา</th>
                <th className="p-4 font-bold">ระดับ</th>
                <th className="p-4 font-bold">เงื่อนไข</th>
                <th className="p-4 font-bold">สถานะ</th>
                <th className="p-4 font-bold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    กำลังโหลด...
                  </td>
                </tr>
              ) : achievements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลฉายา
                  </td>
                </tr>
              ) : (
                achievements.map((achv) => (
                  <tr key={achv.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{achv.title}</div>
                      <div className="text-xs text-slate-500">{achv.desc}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          achv.rarity === 'legendary'
                            ? 'bg-amber-100 text-amber-700'
                            : achv.rarity === 'epic'
                              ? 'bg-purple-100 text-purple-700'
                              : achv.rarity === 'rare'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {achv.rarity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      {achv.conditionType === 'none'
                        ? 'ให้ทุกคน'
                        : achv.conditionType === 'admin'
                          ? 'เฉพาะแอดมิน'
                          : `${achv.conditionType} >= ${achv.conditionValue}`}
                    </td>
                    <td className="p-4">
                      <span
                        className={`w-3 h-3 rounded-full inline-block ${achv.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      ></span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(achv);
                          setIsFormOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(achv.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
