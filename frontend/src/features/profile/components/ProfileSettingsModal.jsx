import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Settings } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { updateUserProfile } from '../../../services/firebase/userService';
import { toast } from '../../../utils/toast';

export default function ProfileSettingsModal({ isOpen, onClose }) {
  const { userData, updateUserData } = useUserStore();
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && userData) {
      setDisplayName(userData.displayName || '');
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('กรุณาระบุชื่อทีม/ชื่อผู้จัดการ');
      return;
    }
    if (displayName.length > 20) {
      toast.error('ชื่อต้องยาวไม่เกิน 20 ตัวอักษร');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(userData.uid, { displayName: displayName.trim() });
      updateUserData({ displayName: displayName.trim() });
      toast.success('บันทึกการตั้งค่าเรียบร้อย!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSaving && onClose()}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Settings size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">การตั้งค่า (Settings)</h3>
          </div>
          {!isSaving && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User size={16} className="text-indigo-500"/>
              ชื่อทีม / ชื่อผู้เล่น
            </label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="กรอกชื่อทีมของคุณ"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold text-slate-800"
              maxLength={20}
            />
            <p className="text-xs text-slate-500 mt-1.5">ความยาวไม่เกิน 20 ตัวอักษร (แสดงในหน้าจัดทีมและตารางคะแนน)</p>
          </div>

          {/* Placeholder for future settings */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 text-center">
              การตั้งค่าอื่นๆ (ระบบแจ้งเตือน ฯลฯ) จะตามมาในอนาคต
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !displayName.trim()}
            className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 active:scale-[0.98] shadow-lg shadow-slate-800/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>บันทึกข้อมูล</span>
          </button>
        </div>

      </div>
    </div>
  );
}
