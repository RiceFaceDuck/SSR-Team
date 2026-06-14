import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Trophy, CheckCircle, Clock } from 'lucide-react';
import { useQuestStore } from '../../../store/questStore';
import QuestFormModal from '../QuestFormModal';

export default function QuestTab() {
  const { quests, isLoading, fetchQuests, addQuest, updateQuest, deleteQuest, toggleStatus } = useQuestStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleCreateNew = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโฆษณา "${title}"?`)) {
      const res = await deleteQuest(id);
      if (!res.success) {
        alert(`ลบไม่สำเร็จ: ${res.message}`);
      }
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const res = await toggleStatus(id, currentStatus);
    if (!res.success) {
      alert(`เปลี่ยนสถานะไม่สำเร็จ: ${res.message}`);
    }
  };

  const handleModalSubmit = async (formData) => {
    if (editingQuest) {
      const res = await updateQuest(editingQuest.id, formData);
      if (res.success) setIsModalOpen(false);
      else alert(`แก้ไขไม่สำเร็จ: ${res.message}`);
    } else {
      const res = await addQuest(formData);
      if (res.success) setIsModalOpen(false);
      else alert(`สร้างไม่สำเร็จ: ${res.message}`);
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Shopee': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'Lazada': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Facebook': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Line': return 'bg-green-100 text-green-600 border-green-200';
      case 'Official': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ภารกิจสปอนเซอร์</h2>
          <p className="text-sm text-slate-500">ระบบเพิ่มโฆษณาและตั้งค่าการแจกรางวัล (Balls ⚽) ให้ผู้เล่น</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} /> สร้างแคมเปญใหม่
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading && quests.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">กำลังโหลดข้อมูลโฆษณา...</p>
          </div>
        ) : quests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">ยังไม่มีแคมเปญโฆษณา</h3>
            <p className="mt-1">กดปุ่ม "สร้างแคมเปญใหม่" ด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-semibold w-16">รูปภาพ</th>
                  <th className="p-4 font-semibold">ชื่อแคมเปญ / ลิงก์</th>
                  <th className="p-4 font-semibold">แพลตฟอร์ม</th>
                  <th className="p-4 font-semibold text-center">รางวัล (Balls)</th>
                  <th className="p-4 font-semibold text-center">เงื่อนไข (ต่อคน)</th>
                  <th className="p-4 font-semibold text-center">สถานะ</th>
                  <th className="p-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quests.map((quest) => (
                  <tr key={quest.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 align-middle">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        {quest.imageUrl ? (
                          <img src={quest.imageUrl} alt="ad" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle max-w-[200px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-800 truncate">{quest.title}</span>
                        {quest.isVerified && <CheckCircle size={14} className="text-blue-500 shrink-0" title="Verified"/>}
                      </div>
                      <a href={quest.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 truncate">
                        <ExternalLink size={12} /> เยี่ยมชมลิงก์
                      </a>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getPlatformColor(quest.platform)}`}>
                        {quest.platform}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200 font-black text-sm">
                        <span>⚽</span> {quest.rewardBalls}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center text-sm">
                      <div className="font-semibold text-slate-700">{quest.maxClaimsPerUser} ครั้ง</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                        <Clock size={10} /> รอ {quest.cooldownHours} ชม.
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <button onClick={() => handleToggle(quest.id, quest.isActive)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${quest.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quest.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(quest)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="แก้ไข">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(quest.id, quest.title)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuestFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingQuest}
      />
    </div>
  );
}
