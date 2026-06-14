import React, { useState, useEffect } from 'react';
import { useAdsStore } from '../../../store/adsStore';
import { Plus, Trash2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export default function AdLinksTab() {
  const { adLinks, updateAdLinks, isLoading } = useAdsStore();
  const [localLinks, setLocalLinks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalLinks(adLinks || []);
  }, [adLinks]);

  const handleAddLink = () => {
    setLocalLinks([
      ...localLinks,
      { id: Date.now().toString(), position: 'save_team', imageUrl: '', linkUrl: '', isActive: true }
    ]);
  };

  const handleRemoveLink = (id) => {
    setLocalLinks(localLinks.filter(l => l.id !== id));
  };

  const handleChange = (id, field, value) => {
    setLocalLinks(localLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateAdLinks(localLinks);
      if (res.success) {
        alert('บันทึกข้อมูลเรียบร้อย');
      } else {
        alert('เกิดข้อผิดพลาด: ' + res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">ติดตั้ง ลิงก์โฆษณา (Custom Ads)</h2>
          <p className="text-sm text-slate-500">ตั้งค่าลิงก์รูปภาพและลิงก์ปลายทางสำหรับตำแหน่งต่างๆ ในเกม</p>
        </div>
        <button 
          onClick={handleAddLink}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> เพิ่มลิงก์โฆษณาใหม่
        </button>
      </div>

      <div className="space-y-4">
        {localLinks.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-500">
            ยังไม่มีการติดตั้งลิงก์โฆษณา กดปุ่มด้านบนเพื่อเพิ่ม
          </div>
        ) : (
          localLinks.map((link, index) => (
            <div key={link.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 space-y-4 w-full">
                
                <div className="flex items-center gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ตำแหน่ง (Position)</label>
                    <select 
                      value={link.position}
                      onChange={(e) => handleChange(link.id, 'position', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="save_team">Save Team (ปุ่มเซฟทีม)</option>
                      <option value="market_banner">Market Banner (แบนเนอร์ตลาก)</option>
                      <option value="page_transition">Page Transition (เปลี่ยนหน้า)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={link.isActive}
                        onChange={(e) => handleChange(link.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">เปิดใช้งาน</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ImageIcon size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Image URL (ลิงก์รูปภาพแบนเนอร์)"
                      value={link.imageUrl}
                      onChange={(e) => handleChange(link.id, 'imageUrl', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon size={16} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Target Link URL (ลิงก์ปลายทางเมื่อคลิก)"
                      value={link.linkUrl}
                      onChange={(e) => handleChange(link.id, 'linkUrl', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

              </div>
              
              <button 
                onClick={() => handleRemoveLink(link.id)}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                title="ลบรายการนี้"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold shadow-sm shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าลิงก์โฆษณา'}
        </button>
      </div>
    </div>
  );
}
