import React, { useState, useRef } from 'react';
import {
  Info,
  Image as ImageIcon,
  User,
  UploadCloud,
  Copy,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { uploadImageToDrive } from '../../../../utils/googleDriveUploader';
import { getOptimizedImageUrl } from '../../utils/formatters';

const PlayerIdentityForm = ({ formData, handleChange, handleFullNameChange, isEdit }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const url = await uploadImageToDrive(file, 'player', true);
      handleChange({ target: { name: 'imageUrl', value: url } });
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const geminiPrompt = `<role>
คุณคือนักวาดภาพประกอบมืออาชีพที่มีความเชี่ยวชาญในการออกแบบตัวละครแนว Esports Cartoon (สไตล์ภาพการ์ตูนกึ่งสมจริงสำหรับเกมกีฬา)
</role>

<context>
ระบบต้องการรูปภาพนักเตะเพื่อนำไปแสดงผลในเกม Fantasy Football โดยต้องมีเอกลักษณ์ที่สม่ำเสมอเหมือนวาดโดยศิลปินคนเดียวกัน
</context>

<task>
1. ค้นหาข้อมูลและลักษณะเด่น (Character) ของนักเตะชื่อ: "${formData.fullName || 'ชื่อนักเตะ'}"
2. สร้างภาพเหมือนของนักเตะคนนี้ในสไตล์ Esports Cartoon
</task>

<format>
- สร้างเป็นรูปภาพเท่านั้น
- อัตราส่วนภาพ: 1:1 (สี่เหลี่ยมจัตุรัส)
- โทนสีและลายเส้น (Art Style): ลายเส้นคมชัด, ใช้สีสันสดใส (Vibrant), มีแสงเงาที่ดูมีมิติแบบ 3D/Esports
- ขนาดไฟล์: บีบอัดให้เล็กที่สุด เหมาะสำหรับใช้บนเว็บไซต์
- ออกแบบให้นักเตะมีการทำท่า Action (สไตล์ E-sport) เหมาะสมกับ Character ดังกล่าว
- ชื่อไฟล์จะต้องตรงกับชื่อนักเตะคนนั้นๆ
- ชุดสวมใส่ไม่จำเป็นต้องสมจริง (แต่ยังคงเอกลักษณ์เรื่องสี ชุดเหย้า)
</format>

<rule>
- บังคับใช้ลายเส้นเดิม โทนสีเดิม กับภาพนักเตะทุกคน เพื่อให้เกิดความสม่ำเสมอ (Consistency)
- ห้ามใส่ตัวอักษรใดๆ ลงในภาพ
- ภาพต้องเป็นพื้นหลังแบบโปร่งใส หรือพื้นหลังสีทึบเรียบๆ ที่ไม่มีลวดลายซับซ้อน
- ต้องเน้นที่ใบหน้าและครึ่งบนของนักเตะ (Portrait)
</rule>`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(geminiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
          <Info size={16} />
        </div>
        <h3 className="font-semibold text-gray-700">ข้อมูลระบุตัวตน</h3>
      </div>

      {/* พรีวิวภาพนักเตะ */}
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl relative overflow-hidden group hover:border-blue-300 transition-colors">
        {formData.imageUrl ? (
          <img
            src={getOptimizedImageUrl(formData.imageUrl)}
            alt="Preview"
            className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md bg-white z-10"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-md items-center justify-center ${formData.imageUrl ? 'hidden' : 'flex'}`}
        >
          <User size={32} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
        </div>

        {/* ปุ่มอัปโหลด */}
        <div className="mt-4 w-full flex flex-col items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200 w-full"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
          </button>

          {uploadError && <div className="text-xs text-red-500 mt-1">{uploadError}</div>}
        </div>

        <div className="w-full mt-3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ImageIcon size={14} className="text-gray-400" />
          </div>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="หรือวางลิงก์รูปภาพ (URL)"
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Prompt สำหรับ Gemini */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100 relative group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
            <Sparkles size={16} />
            <span>Prompt สำหรับ Gemini</span>
          </div>
          <button
            type="button"
            onClick={copyPrompt}
            className="p-1.5 bg-white text-purple-600 hover:bg-purple-100 rounded-md shadow-sm border border-purple-200 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
          </button>
        </div>
        <p className="text-xs text-purple-600/80 mb-2">
          ใช้ข้อความนี้เพื่อสร้างรูปภาพนักเตะที่ตรงตามสไตล์ของเกม (เปลี่ยนตามชื่อนักเตะ)
        </p>
        <div className="bg-white/60 p-3 rounded-lg border border-purple-100/50 text-xs text-gray-700 max-h-32 overflow-y-auto custom-scrollbar font-mono">
          {geminiPrompt.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      </div>

      <div>
        <label className="flex justify-between items-end text-sm font-medium text-gray-700 mb-1">
          <span>
            SKU (รหัสอ้างอิง) <span className="text-red-500">*</span>
          </span>
          {formData.sku && formData.sku.startsWith('API-') && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
              API Synced
            </span>
          )}
          {formData.sku && formData.sku.startsWith('EXCEL-') && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Excel Import
            </span>
          )}
        </label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="เช่น PLY-001"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          required
          disabled={isEdit || (formData.sku && formData.sku.startsWith('API-'))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อเต็ม (Full Name) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleFullNameChange}
          placeholder="เช่น Bukayo Saka"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อย่อ (หน้าเกม)</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        />
      </div>
    </div>
  );
};

export default PlayerIdentityForm;
