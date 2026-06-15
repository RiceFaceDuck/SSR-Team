import React from 'react';
import { useThemeUploadLogic } from '../hooks/useThemeUploadLogic';
import ThemeUploadField from './ThemeUploadField';
import ThemePromptBox from './ThemePromptBox';

export default function ThemeSettings({ config, handleThemeChange, handleSetDefaultTheme }) {
  const { uploadingKey, handleSelectHistory, handleFileUpload } = useThemeUploadLogic(config, handleThemeChange);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">การตั้งค่าธีมและภาพหน้าจอ (Theme Management)</h2>
          <p className="text-xs text-slate-500 mt-1">อัปโหลดภาพผ่าน Google Drive อัตโนมัติ หรือวางลิงก์รูปภาพก็ได้</p>
        </div>
        <button 
          onClick={handleSetDefaultTheme}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl transition-colors"
        >
          โหลดธีมเริ่มต้น
        </button>
      </div>

      <ThemePromptBox />

      <div className="space-y-4">
        <ThemeUploadField
          label="พื้นหลังหน้า Login (Login Background)"
          themeKey="loginBackgroundUrl"
          placeholder="https://..."
          adviceText="แนะนำ: ขนาด 1080x1920 px (แนวตั้ง) หรือ 1920x1080 px (แนวนอน) ควรเป็นภาพสไตล์ Dark/Moody มีความมืดหรือลดแสง (Vignette) เล็กน้อยเพื่อให้ปุ่มและตัวหนังสือลอยเด่นขึ้นมา"
          config={config}
          handleThemeChange={handleThemeChange}
          uploadingKey={uploadingKey}
          handleFileUpload={handleFileUpload}
          handleSelectHistory={handleSelectHistory}
        />

        <ThemeUploadField
          label="ภาพตกแต่งลอยไปมา (Floating Object)"
          themeKey="floatingObjectUrl"
          placeholder="https://..."
          adviceText="แนะนำ: ไฟล์ .PNG แบบโปร่งใส (Transparent) ขนาด 500x500 px เช่น รูปถ้วยรางวัล ลูกฟุตบอล หรือกล่องของขวัญ ภาพจะแสดงเอฟเฟกต์ลอยขึ้นลงแบบ 3D ตรงกลางหน้าจอ Login"
          config={config}
          handleThemeChange={handleThemeChange}
          uploadingKey={uploadingKey}
          handleFileUpload={handleFileUpload}
          handleSelectHistory={handleSelectHistory}
        />

        <ThemeUploadField
          label="พื้นหลังหน้าตลาด (Market Background)"
          themeKey="marketBackgroundUrl"
          placeholder="https://..."
          adviceText="แนะนำ: ขนาด 1920x1080 px โทนสีมืดและเรียบง่าย ไม่ควรมีลวดลายรกเกินไป เพื่อให้อ่านชื่อนักเตะและรายละเอียดการ์ดได้ง่าย"
          config={config}
          handleThemeChange={handleThemeChange}
          uploadingKey={uploadingKey}
          handleFileUpload={handleFileUpload}
          handleSelectHistory={handleSelectHistory}
        />
      </div>
      
      <div className="p-4 bg-blue-50/50 text-blue-800 rounded-xl text-sm border border-blue-100 flex gap-3 items-start">
        <span className="text-xl">💡</span>
        <div>
          <p className="font-bold mb-1">ข้อมูลระบบ</p>
          <p className="text-blue-700/80">ระบบตลาดและแผนการเล่นถูกปรับเป็นสีกรมท่า (Dark Blue) และปุ่มกดเป็นสีฟ้า/เทาแล้ว (Hardcoded เพื่อความลื่นไหล) การอัปโหลดภาพจะบันทึกและแสดงผลลัพธ์ทันทีที่ฝั่งผู้เล่น</p>
        </div>
      </div>
    </div>
  );
}
