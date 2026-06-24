import React, { useState } from 'react';
import { Users, X, Download, CheckCircle, Info, FileSpreadsheet, Copy, Bot } from 'lucide-react';

import PlayerList from './views/PlayerList';
import PlayerDetails from './views/PlayerDetails';
import PlayerManualForm from './components/PlayerManualForm';
import ExcelPreview from './components/ExcelPreview';
import Dropzone from '../../components/ui/Dropzone';
import PlayerValueManager from './views/PlayerValueManager';

import { usePlayers } from './hooks/usePlayers';
import { parseExcelFile } from './utils/excelParser';
import { downloadPlayerTemplate } from './utils/templateUtil';

const PlayerFeature = () => {
  const { saveManualPlayer, addMultiplePlayers } = usePlayers();

  const [modal, setModal] = useState({
    isOpen: false,
    type: null, 
    data: null  
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  const closeModal = () => {
    if (!isProcessing) {
      setModal({ isOpen: false, type: null, data: null });
      setIsDownloaded(false);
    }
  };

  const openManualForm = (player = null) => setModal({ isOpen: true, type: 'manual', data: player });
  const openImportExcel = () => setModal({ isOpen: true, type: 'import-drop', data: null });
  const openPlayerDetails = (player) => setModal({ isOpen: true, type: 'details', data: player });
  const openValueEngine = () => setModal({ isOpen: true, type: 'value-engine', data: null });

  const handleDownloadTemplate = () => {
    const success = downloadPlayerTemplate();
    if (success) {
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } else {
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Template");
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

  const handleExcelDrop = async (file) => {
    setIsProcessing(true);
    try {
      const parsedData = await parseExcelFile(file);
      setModal({ isOpen: true, type: 'import-preview', data: parsedData });
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async (data) => {
    setIsProcessing(true);
    const result = await addMultiplePlayers(data);
    setIsProcessing(false);
    
    if (result.success) {
      alert(`นำเข้าข้อมูลนักเตะสำเร็จ ${result.count} รายการ`);
      closeModal();
    } else {
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${result.error?.message}`);
    }
  };

  const handleSaveManual = async (formData) => {
    setIsProcessing(true);
    const result = await saveManualPlayer(formData);
    setIsProcessing(false);

    if (result.success) {
      closeModal();
    } else {
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${result.error?.message}`);
    }
  };

  const renderModalContent = () => {
    switch (modal.type) {
      case 'manual':
        return (
          <div className="w-full max-w-3xl">
            <PlayerManualForm 
              initialData={modal.data} 
              onSubmit={handleSaveManual}
              onCancel={closeModal}
              isLoading={isProcessing}
            />
          </div>
        );
      case 'details':
        return <PlayerDetails player={modal.data} onClose={closeModal} onEdit={openManualForm} />;
      case 'import-drop':
        return (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-7 relative border border-gray-100/50">
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">นำเข้าข้อมูลจาก Excel</h2>
                <p className="text-sm text-gray-500 mt-0.5">ลากไฟล์มาวาง หรืออัปโหลดไฟล์ (.xlsx, .csv) เพื่อเพิ่มนักเตะจำนวนมาก</p>
              </div>
            </div>
            <Dropzone onFileSelected={handleExcelDrop} isLoading={isProcessing} />
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
                  {isDownloaded ? <CheckCircle className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  {isDownloaded ? 'ดาวน์โหลดสำเร็จ!' : 'โหลด Template'}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-br from-purple-50 to-fuchsia-50/50 border border-purple-100/50 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    ใช้ AI ช่วยสร้างข้อมูลให้ไหม?
                  </h3>
                  <p className="text-xs text-purple-700/80 mt-1.5 leading-relaxed pr-4">
                    คัดลอก Prompt สำเร็จรูปไปวางใน ChatGPT หรือ Gemini พร้อมแนบไฟล์ Template เพื่อให้ AI หาข้อมูลและจัดฟอร์แมตให้ทันที
                  </p>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all shrink-0 shadow-sm
                    ${isPromptCopied ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white'}`}
                >
                  {isPromptCopied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {isPromptCopied ? 'คัดลอกแล้ว!' : 'คัดลอก Prompt'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'import-preview':
        return (
          <div className="w-full max-w-5xl">
            <ExcelPreview 
              data={modal.data}
              onConfirm={handleConfirmImport}
              onCancel={() => setModal({ isOpen: true, type: 'import-drop', data: null })}
              isLoading={isProcessing}
            />
          </div>
        );
      case 'value-engine':
        return (
          <div className="w-full max-w-6xl">
            <PlayerValueManager onClose={closeModal} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow-md shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">จัดการข้อมูลนักเตะ (Players)</h1>
          </div>
          <p className="text-gray-500">เพิ่ม, แก้ไข, อัปเดตสถิติ และราคาของนักเตะในระบบ Fantasy</p>
        </div>
        <button
          onClick={openValueEngine}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-indigo-200 shadow-sm flex items-center justify-center"
        >
          คำนวณมูลค่านักเตะ (Value Engine)
        </button>
      </div>

      <PlayerList 
        onAddManual={() => openManualForm()}
        onImportExcel={openImportExcel}
        onEditPlayer={openManualForm}
      />

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={closeModal}></div>
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerFeature;