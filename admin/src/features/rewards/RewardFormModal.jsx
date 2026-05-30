import React, { useState, useEffect } from 'react';
import { useRewardStore } from '../../store/rewardStore';
import { X, Image as ImageIcon, Box, Tag, Zap, Clock, Info } from 'lucide-react';

const RewardFormModal = ({ isOpen, onClose, rewardToEdit = null }) => {
  // ดึงฟังก์ชันจัดการข้อมูลจาก Store
  const { addReward, updateReward } = useRewardStore();

  // ค่าเริ่มต้นของฟอร์ม
  const defaultForm = {
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    stock: 0,
    type: 'normal',
    isActive: true,
    isFlashSale: false,
    flashSaleEndTime: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // ถ้ามีการส่งข้อมูล rewardToEdit เข้ามา ให้เอามาใส่ฟอร์ม (โหมดแก้ไข)
  useEffect(() => {
    if (isOpen) {
      if (rewardToEdit) {
        // จัดการเรื่องเวลา format สำหรับ input type="datetime-local"
        let formattedTime = '';
        if (rewardToEdit.flashSaleEndTime) {
          const date = new Date(rewardToEdit.flashSaleEndTime);
          if (!isNaN(date)) {
             // ตัดทอนเป็นรูปแบบ YYYY-MM-DDTHH:mm
            formattedTime = date.toISOString().slice(0, 16);
          }
        }
        
        setFormData({
          ...rewardToEdit,
          flashSaleEndTime: formattedTime
        });
      } else {
        setFormData(defaultForm);
      }
      setErrorMsg(null);
    }
  }, [isOpen, rewardToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate เบื้องต้น
    if (!formData.name.trim()) return setErrorMsg('กรุณากรอกชื่อของรางวัล');
    if (formData.price < 0) return setErrorMsg('ราคาห้ามติดลบ');
    if (formData.stock < 0) return setErrorMsg('สต็อกห้ามติดลบ');
    if (formData.isFlashSale && !formData.flashSaleEndTime) {
      return setErrorMsg('กรุณาระบุเวลาสิ้นสุด Flash Sale');
    }

    setIsSubmitting(true);
    try {
      if (rewardToEdit) {
        await updateReward(rewardToEdit.id, formData);
      } else {
        await addReward(formData);
      }
      onClose(); // ปิด Modal เมื่อสำเร็จ
    } catch (error) {
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ถ้าไม่ได้เปิด Modal อยู่ ไม่ต้อง Render อะไร
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {rewardToEdit ? <Tag size={20} className="text-blue-500" /> : <Box size={20} className="text-green-500" />}
            {rewardToEdit ? 'แก้ไขของรางวัล' : 'สร้างของรางวัลใหม่'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 text-sm">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form id="reward-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* โซนข้อมูลทั่วไป */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">ข้อมูลพื้นฐาน (Basic Info)</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ชื่อของรางวัล <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="เช่น บัตรเติมเกม 300 บาท, กล่องสุ่มระดับ Epic..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">รายละเอียด</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="อธิบายรายละเอียดของรางวัล เงื่อนไขการรับ..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL รูปภาพ</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ImageIcon size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.png"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

            {/* โซนราคาและคลังสินค้า */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">มูลค่าและสต็อก (Economy)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ราคา (Balls ⚽) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนคงเหลือ (Stock) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">การตั้งค่าพิเศษ (Gamification)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ประเภทไอเทม</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="normal">แลกเปลี่ยนปกติ (Normal)</option>
                    <option value="gacha">กล่องสุ่ม (Mystery Gacha)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFlashSale"
                      checked={formData.isFlashSale}
                      onChange={handleChange}
                      className="w-5 h-5 text-amber-500 bg-white border-slate-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                      <Zap size={16} /> เปิดโหมดจำกัดเวลา (Flash Sale)
                    </span>
                  </label>

                  {formData.isFlashSale && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Clock size={12} /> สิ้นสุดวันที่และเวลา
                      </label>
                      <input
                        type="datetime-local"
                        name="flashSaleEndTime"
                        value={formData.flashSaleEndTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* สถานะการมองเห็น */}
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">เปิดใช้งาน (ให้ผู้เล่นเห็น)</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="reward-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : rewardToEdit ? 'บันทึกการแก้ไข' : 'สร้างของรางวัล'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardFormModal;