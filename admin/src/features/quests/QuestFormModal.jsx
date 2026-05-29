import React, { useState, useEffect } from 'react';
import { X, Save, Link as LinkIcon, Image as ImageIcon, CheckCircle, Clock, Users, Trophy } from 'lucide-react';

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  // --- State สำหรับเก็บข้อมูลฟอร์ม ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    platform: 'Other',
    rewardBalls: 20,
    maxClaimsPerUser: 1,
    cooldownHours: 24,
    targetUrl: '',
    isVerified: false,
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Reset/Populate Form เมื่อเปิด Modal ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // กรณีแก้ไข (Edit)
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          imageUrl: initialData.imageUrl || '',
          platform: initialData.platform || 'Other',
          rewardBalls: Number(initialData.rewardBalls) || 20,
          maxClaimsPerUser: Number(initialData.maxClaimsPerUser) || 1,
          cooldownHours: Number(initialData.cooldownHours) || 24,
          targetUrl: initialData.targetUrl || '',
          isVerified: initialData.isVerified || false,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true
        });
      } else {
        // กรณีสร้างใหม่ (Create)
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          platform: 'Other',
          rewardBalls: 20,
          maxClaimsPerUser: 1,
          cooldownHours: 24,
          targetUrl: '',
          isVerified: false,
          isActive: true
        });
      }
    }
  }, [isOpen, initialData]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // แปลงค่า Number ให้ชัวร์ก่อนส่ง
    const submissionData = {
      ...formData,
      rewardBalls: Number(formData.rewardBalls),
      maxClaimsPerUser: Number(formData.maxClaimsPerUser),
      cooldownHours: Number(formData.cooldownHours)
    };

    await onSubmit(submissionData);
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {initialData ? 'แก้ไขโฆษณา/ภารกิจ' : 'สร้างโฆษณา/ภารกิจใหม่'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">กำหนดรายละเอียดและเงื่อนไขการแจกรางวัล</p>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto">
          <form id="quest-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. ข้อมูลพื้นฐาน */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">ชื่อแคมเปญโฆษณา <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="เช่น สมัครสมาชิกเว็บผู้สนับสนุน..." 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">คำอธิบายเพิ่มเติม</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="รายละเอียดภารกิจสั้นๆ (ถ้ามี)" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon size={16} className="text-slate-400"/> URL รูปภาพ (สัดส่วน 1:1) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="url" 
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://... (Google Drive/Imgur)" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon size={16} className="text-slate-400"/> ลิงก์ปลายทาง (Target URL) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="url" 
                  name="targetUrl"
                  required
                  value={formData.targetUrl}
                  onChange={handleChange}
                  placeholder="https://..." 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. การตั้งค่าระบบรางวัล */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500"/> ตั้งค่ารางวัล & โควต้า
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    แจก Balls ⚽
                  </label>
                  <input 
                    type="number" 
                    name="rewardBalls"
                    required
                    min="1"
                    value={formData.rewardBalls}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition-all font-bold text-amber-600 bg-amber-50/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Users size={14} className="text-slate-400"/> โควต้ากด/คน
                  </label>
                  <input 
                    type="number" 
                    name="maxClaimsPerUser"
                    required
                    min="1"
                    value={formData.maxClaimsPerUser}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                    <Clock size={14} className="text-slate-400"/> เวลารอ (ชั่วโมง)
                  </label>
                  <input 
                    type="number" 
                    name="cooldownHours"
                    required
                    min="0"
                    step="0.5"
                    value={formData.cooldownHours}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 3. การแสดงผล (Platform & Badge) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">แพลตฟอร์ม (Platform)</label>
                <select 
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
                >
                  <option value="Official">Official (ระบบ)</option>
                  <option value="Shopee">Shopee</option>
                  <option value="Lazada">Lazada</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Line">Line</option>
                  <option value="Other">Other (อื่นๆ)</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox"
                      name="isVerified"
                      checked={formData.isVerified}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.isVerified ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                      {formData.isVerified && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">แสดงตรา Verified ✔️</p>
                    <p className="text-xs text-slate-500">เพิ่มความน่าเชื่อถือให้กับป้ายนี้</p>
                  </div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer (Actions) */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button 
            type="submit"
            form="quest-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save size={18} />
            )}
            {initialData ? 'บันทึกการแก้ไข' : 'สร้างภารกิจ'}
          </button>
        </div>

      </div>
    </div>
  );
}