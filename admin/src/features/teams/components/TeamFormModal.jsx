import React, { useState } from 'react';
import { Save, UploadCloud } from 'lucide-react';
import { uploadImageToDrive } from '../../../utils/googleDriveUploader';

const TeamFormModal = ({ editingTeam, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || { id: '', name: '', shortName: '', logo: '' }
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageToDrive(file);
      setFormData((prev) => ({ ...prev, logo: url }));
    } catch (err) {
      alert('อัพโหลดรูปภาพล้มเหลว: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('กรุณากรอกชื่อทีม');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          {editingTeam === 'new' ? '✨ เพิ่มทีมใหม่' : '✏️ แก้ไขข้อมูลทีม'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อสโมสร</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
              placeholder="เช่น Arsenal"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ชื่อย่อ (Short Name)
            </label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) =>
                setFormData({ ...formData, shortName: e.target.value.toUpperCase() })
              }
              maxLength={4}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold uppercase"
              placeholder="เช่น ARS, MUN, LIV"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพโลโก้สโมสร</label>
            <div className="flex items-start gap-4">
              {formData.logo && (
                <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain drop-shadow-md"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <label
                    className={`flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <UploadCloud className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-slate-700">
                      {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดจากเครื่อง'}
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <span className="text-xs text-gray-500 font-medium">หรือวาง URL ด้านล่าง</span>
                </div>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-sm"
                  placeholder="https://... (URL โลโก้)"
                  disabled={isUploading}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              'กำลังบันทึก...'
            ) : (
              <>
                <Save className="w-5 h-5" /> บันทึกข้อมูล
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamFormModal;
