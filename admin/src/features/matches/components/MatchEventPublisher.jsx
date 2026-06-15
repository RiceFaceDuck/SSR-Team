import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';

const EVENT_TEMPLATES = [
  { label: '⚽ ยิงประตู', primary: 'Goal ⚽', secondary: 'Assist 👟' },
  { label: '🟨 ใบเหลือง', primary: 'Yellow Card 🟨', secondary: '' },
  { label: '🟥 ใบแดง', primary: 'Red Card 🟥', secondary: '' },
  { label: '🔄 เปลี่ยนตัว', primary: 'Substitution 🔄', secondary: 'In / Out' },
  { label: '🏁 พักครึ่ง', primary: 'Half Time 🏁', secondary: '' },
  { label: '🏆 จบเกม', primary: 'Full Time 🏆', secondary: '' },
];

export default function MatchEventPublisher({ match, onPublish, isUpdating }) {
  const [eventData, setEventData] = useState({
    minute: '',
    primaryDetail: '',
    secondaryDetail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (template) => {
    setEventData(prev => ({
      ...prev,
      primaryDetail: template.primary,
      secondaryDetail: template.secondary,
      minute: match?.minute || ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventData.primaryDetail) return;
    
    onPublish({
      minute: eventData.minute || match?.minute || '0',
      primaryDetail: eventData.primaryDetail,
      secondaryDetail: eventData.secondaryDetail
    });

    // Clear form after publish
    setEventData({
      minute: '',
      primaryDetail: '',
      secondaryDetail: ''
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" /> ประกาศเหตุการณ์ (Live Event)
        </h3>
      </div>

      <div className="p-6">
        {/* Templates Gimmick */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3">คีย์ลัด (Quick Templates)</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tpl)}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-500 mb-1">นาที (Minute)</label>
              <input 
                type="text" 
                name="minute" 
                value={eventData.minute} 
                onChange={handleChange} 
                placeholder={match?.minute || "e.g. 45'"} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-500 mb-1">รายละเอียดหลัก (หัวข้อ) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="primaryDetail" 
                value={eventData.primaryDetail} 
                onChange={handleChange} 
                placeholder="เช่น B. Saka Goal ⚽" 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">รายละเอียดรอง (คำอธิบายเพิ่มเติม)</label>
            <input 
              type="text" 
              name="secondaryDetail" 
              value={eventData.secondaryDetail} 
              onChange={handleChange} 
              placeholder="เช่น Assist by M. Odegaard" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-600"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isUpdating || !eventData.primaryDetail}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
            >
              {isUpdating ? <span className="animate-spin">⏳</span> : <Send size={18} />}
              เผยแพร่เหตุการณ์ทันที
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
