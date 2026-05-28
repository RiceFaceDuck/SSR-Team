import React, { useState } from 'react';
import { Users, X, Copy, CheckCircle, Info } from 'lucide-react';

// นำเข้า Views และ Components ที่เราสร้างไว้ทั้งหมด
import PlayerList from './views/PlayerList';
import PlayerDetails from './views/PlayerDetails';
import PlayerManualForm from './components/PlayerManualForm';
import ExcelPreview from './components/ExcelPreview';
import Dropzone from '../../components/ui/Dropzone';

// นำเข้า Hooks และ Utils สำหรับจัดการข้อมูล
import { usePlayers } from './hooks/usePlayers';
import { parseExcelFile } from './utils/excelParser';

/**
 * PlayerFeature (Main Container)
 * เป็นหน้าหลักของระบบจัดการนักเตะที่รวบรวมทุก Component ไว้ด้วยกัน
 * ทำหน้าที่จัดการ State ของ Modal (เปิด/ปิด หน้าต่างต่างๆ) และเชื่อมต่อ Logic พื้นฐาน
 */
const PlayerFeature = () => {
  // ดึงฟังก์ชันสำหรับบันทึกข้อมูลจาก Hook
  const { saveManualPlayer, addMultiplePlayers } = usePlayers();

  // State สำหรับจัดการหน้าต่าง (Modal)
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'manual', 'details', 'import-drop', 'import-preview'
    data: null  // เก็บข้อมูลส่งต่อ เช่น ข้อมูลนักเตะที่เลือก หรือ ข้อมูล Excel ที่แปลงแล้ว
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // สำหรับปุ่ม Copy Headers

  // --- ฟังก์ชันจัดการเปิด/ปิด Modal ---
  const closeModal = () => {
    if (!isProcessing) {
      setModal({ isOpen: false, type: null, data: null });
      setIsCopied(false);
    }
  };

  const openManualForm = (player = null) => {
    setModal({ isOpen: true, type: 'manual', data: player });
  };

  const openImportExcel = () => {
    setModal({ isOpen: true, type: 'import-drop', data: null });
  };

  const openPlayerDetails = (player) => {
    setModal({ isOpen: true, type: 'details', data: player });
  };

  // --- ฟังก์ชันจัดการคำแนะนำ Excel ---
  const handleCopyHeaders = () => {
    // ใช้ \t (Tab) คั่นเพื่อให้เวลา Paste ลง Excel แล้วข้อมูลแยกไปอยู่ทีละคอลัมน์ให้อัตโนมัติ
    const headers = "SKU\tName\tPosition\tTeam\tPrice\tPoints\tStatus\tGoals\tAssists\tCleanSheets\tYellowCards\tRedCards";
    
    // คำสั่งคัดลอกลง Clipboard
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(headers);
    } else {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = headers;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textArea);
    }

    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- ฟังก์ชันจัดการข้อมูล (Actions) ---

  // 1. จัดการเมื่อผู้ใช้เลือกไฟล์ Excel
  const handleExcelDrop = async (file) => {
    setIsProcessing(true);
    try {
      const parsedData = await parseExcelFile(file);
      // เมื่อแยกข้อมูลสำเร็จ ให้เปลี่ยนหน้าต่างเป็น Preview และส่งข้อมูลไปแสดง
      setModal({ isOpen: true, type: 'import-preview', data: parsedData });
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. จัดการเมื่อผู้ใช้กดยืนยันนำเข้าข้อมูลจากหน้า Preview
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

  // 3. จัดการเมื่อผู้ใช้กดบันทึกจากหน้าฟอร์ม Manual
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

  // --- ฟังก์ชัน Render เนื้อหาใน Modal ---
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
        return (
          <PlayerDetails 
            player={modal.data} 
            onClose={closeModal} 
            onEdit={(player) => openManualForm(player)} 
          />
        );
      
      case 'import-drop':
        return (
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">นำเข้าข้อมูลจาก Excel</h2>
              <p className="text-sm text-gray-500 mt-1">อัปโหลดไฟล์ Excel (.xlsx, .csv) เพื่อเพิ่มนักเตะจำนวนมาก</p>
            </div>
            
            <Dropzone 
              onFileSelected={handleExcelDrop} 
              isLoading={isProcessing} 
            />

            {/* ส่วนคำแนะนำการสร้าง Template Excel */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                คำแนะนำการเตรียมไฟล์ Excel
              </h3>
              <p className="text-xs text-blue-600 mb-3 leading-relaxed">
                สร้างไฟล์ Excel ใหม่ (แผ่นงานแรก) และคัดลอกหัวข้อคอลัมน์ด้านล่างนี้ ไปวางที่ <b>แถวแรก (Row 1 / Cell A1)</b> ของไฟล์ ระบบจะกระจายคอลัมน์ให้โดยอัตโนมัติ
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white border border-blue-200 rounded-md p-2 gap-3">
                <div className="overflow-x-auto whitespace-nowrap text-xs font-mono text-gray-600 py-1 flex-1 w-full scrollbar-hide">
                  SKU, Name, Position, Team, Price, Points, Status, Goals, Assists...
                </div>
                <button
                  onClick={handleCopyHeaders}
                  className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-xs font-medium rounded-md transition-colors shrink-0 shadow-sm
                    ${isCopied ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {isCopied ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {isCopied ? 'คัดลอกแล้ว!' : 'คัดลอกหัวคอลัมน์'}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 text-[11px] text-gray-500 gap-x-4 gap-y-2">
                <p><b className="text-gray-700">SKU:</b> รหัสอ้างอิง (ห้ามซ้ำ) <span className="text-red-500">*จำเป็น</span></p>
                <p><b className="text-gray-700">Name:</b> ชื่อนักเตะ <span className="text-red-500">*จำเป็น</span></p>
                <p><b className="text-gray-700">Position:</b> FW, MF, DF, GK</p>
                <p><b className="text-gray-700">Status:</b> active, injured, suspended</p>
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
              onCancel={() => setModal({ isOpen: true, type: 'import-drop', data: null })} // กดยกเลิกให้กลับไปหน้า Dropzone
              isLoading={isProcessing}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header ของหน้าจัดการนักเตะ */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลนักเตะ (Players)</h1>
        </div>
        <p className="text-gray-500">จัดการรายชื่อ ข้อมูลสถิติ และราคาของนักเตะในระบบ Fantasy</p>
      </div>

      {/* Main Content (ตารางรายชื่อนักเตะ) */}
      <PlayerList 
        onAddManual={() => openManualForm()}
        onImportExcel={openImportExcel}
        onEditPlayer={(player) => openPlayerDetails(player)} // เมื่อกดที่ตารางให้เปิดหน้า Details ก่อน
      />

      {/* Modal Overlay (แสดงผลเมื่อมีการสั่งเปิดหน้าต่างย่อย) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* พื้นหลังสีดำโปร่งแสง */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal} // คลิกพื้นหลังเพื่อปิด (ถ้าไม่ได้โหลดอยู่)
          ></div>
          
          {/* เนื้อหา Modal (อยู่เหนือพื้นหลัง) */}
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerFeature;