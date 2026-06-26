import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, Info, X } from 'lucide-react';
import Dropzone from '../../../components/ui/Dropzone';
import PlayerAiPrompt from './PlayerAiPrompt';
import { downloadPlayerTemplate } from '../utils/templateUtil';

export default function PlayerImportTools({ onFileSelected, isLoading, onClose }) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  const handleDownloadTemplate = () => {
    const success = downloadPlayerTemplate();
    if (success) {
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } else {
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ Template');
    }
  };

  const handleCopyPrompt = () => {
    const promptText = `<role>
คุณคือผู้เชี่ยวชาญด้านข้อมูลกีฬา (Sports Data Analyst) และวิศวกรข้อมูล (Data Engineer) ที่มีความแม่นยำสูง
</role>

<task>
ค้นหาข้อมูลนักเตะชุดใหญ่ **ทั้งหมดทุกคน** ของทีม [ พิมพ์ชื่อทีมที่ต้องการตรงนี้ ] ประจำฤดูกาลปัจจุบัน โดยต้องเป็นข้อมูลที่ **อัปเดตใหม่ล่าสุดภายในสัปดาห์นี้เท่านั้น** และนำมาจัดให้อยู่ในรูปแบบไฟล์ CSV ที่สมบูรณ์แบบ
</task>

<instructions>
1. ใช้ Web Search ค้นหาข้อมูลให้ "อัปเดตใหม่ล่าสุดในสัปดาห์นี้" ทั้งเรื่องการย้ายทีม อาการบาดเจ็บ และสถิติต่างๆ ให้ครบทุกคนในทีมชุดใหญ่ ห้ามตกหล่น
2. แปลงข้อมูลให้อยู่ในตาราง โดยแถวแรกสุด (Header) ต้องมีคอลัมน์ต่อไปนี้แบบเป๊ะๆ:
   ชื่อ (Name),ตำแหน่ง (Pos),ทีม (Team),ราคา (Price),สถานะ (Status),คะแนน (Points),ประตู (Goals),แอสซิสต์ (Assists),คลีนชีต (CleanSheets),ใบเหลือง (YellowCards),ใบแดง (RedCards)
3. กฎการกรอกข้อมูลแต่ละคอลัมน์ (ห้ามทำผิดเด็ดขาด):
   - ชื่อ (Name): ใช้ **"ชื่อย่อนักเตะ"** หรือชื่อที่ใช้หลังเสื้อแข่งเท่านั้น (เช่น M. Rashford หรือ B. Fernandes ห้ามพิมพ์ชื่อเต็มยาวๆ)
   - ตำแหน่ง (Pos): ตัวย่อภาษาอังกฤษเท่านั้น (GK, DEF, MID, FWD)
   - ทีม (Team): ใช้ **"ชื่อย่อสโมสร 3 ตัวอักษรภาษาอังกฤษ"** เท่านั้น (เช่น แมนยู = MUN, ลิเวอร์พูล = LIV, อาร์เซนอล = ARS)
   - ราคา (Price): ตัวเลขประเมินราคา (ตัวเลขล้วน ห้ามมีลูกน้ำ)
   - สถานะ (Status): เช็กอาการล่าสุดในสัปดาห์นี้ ให้ใส่แค่ active (พร้อมลงสนาม), injured (บาดเจ็บ), หรือ suspended (ติดโทษแบน)
   - คะแนน (Points): **ให้ใส่เลข 0 ทุกคน** (ไม่ต้องคำนวณคะแนนมาให้ ระบบจะนำไปคำนวณเอง)
   - ประตู (Goals) ถึง ใบแดง (RedCards): ใส่สถิติตัวเลขล่าสุดจริงๆ หากยังไม่มีผลงานให้ใส่ 0
4. หากข้อความในเซลล์ใดมีเครื่องหมายลูกน้ำ (,) ให้ใส่เครื่องหมายคำพูดครอบข้อความนั้นไว้เสมอ
</instructions>

<format>
- ผลลัพธ์สุดท้ายต้องเป็นรูปแบบข้อความ CSV (Comma Separated Values) ล้วนๆ
- ข้อมูลทั้งหมดต้องบรรจุอยู่ภายใน Code Block เพียงอันเดียวเท่านั้น
- ห้ามพิมพ์ข้อความอธิบายใดๆ นอกเหนือจากกรอบ Code Block เด็ดขาด
</format>`;
    navigator.clipboard.writeText(promptText);
    setIsPromptCopied(true);
    setTimeout(() => setIsPromptCopied(false), 2000);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-7 relative border border-gray-100/50">
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">นำเข้าข้อมูลจาก Excel</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            ลากไฟล์มาวาง หรืออัปโหลดไฟล์ (.xlsx, .csv) เพื่อเพิ่มนักเตะจำนวนมาก
          </p>
        </div>
      </div>
      
      <Dropzone onFileSelected={onFileSelected} isLoading={isLoading} />
      
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              ต้องการไฟล์ตั้งต้น (Template) หรือไม่?
            </h3>
            <p className="text-xs text-blue-700/80 mt-1.5 leading-relaxed pr-4">
              เพื่อป้องกันการพิมพ์หัวตารางผิดพลาด เราขอแนะนำให้ดาวน์โหลดไฟล์ Template ของระบบไปใช้งาน
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all shrink-0 shadow-sm
              ${isDownloaded ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white'}`}
          >
            {isDownloaded ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloaded ? 'ดาวน์โหลดสำเร็จ!' : 'โหลด Template'}
          </button>
        </div>
      </div>

      <PlayerAiPrompt isPromptCopied={isPromptCopied} onCopyPrompt={handleCopyPrompt} />
    </div>
  );
}
