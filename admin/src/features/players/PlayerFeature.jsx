import React, { useState } from 'react';
import { Users, X, Download, CheckCircle, Info, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx'; // เพิ่ม Import XLSX สำหรับสร้างไฟล์ Template

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
  const [isDownloaded, setIsDownloaded] = useState(false); // เปลี่ยนจาก isCopied เป็นสถานะการดาวน์โหลด

  // --- ฟังก์ชันจัดการเปิด/ปิด Modal ---
  const closeModal = () => {
    if (!isProcessing) {
      setModal({ isOpen: false, type: null, data: null });
      setIsDownloaded(false);
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

  // --- 🔥 ฟังก์ชันสร้างและดาวน์โหลดไฟล์ Template Excel ---
  const handleDownloadTemplate = () => {
    try {
      // 1. กำหนดหัวตารางและใส่ข้อมูลตัวอย่าง 1 แถวให้แอดมินดูเป็นไกด์ไลน์
      const templateData = [
        ["SKU", "Name", "Position", "Team", "Price", "Points", "Status", "Goals", "Assists", "CleanSheets", "YellowCards", "RedCards"],
        ["PLY-001", "Lionel Messi", "FWD", "Inter Miami", 12.5, 0, "active", 0, 0, 0, 0, 0]
      ];

      // 2. แปลง Array ให้เป็น Worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(templateData);

      // 3. ปรับขนาดความกว้างของคอลัมน์ให้สวยงาม (UX)
      const wscols = [
        { wch: 15 }, // SKU
        { wch: 25 }, // Name
        { wch: 10 }, // Position
        { wch: 20 }, // Team
        { wch: 10 }, // Price
        { wch: 10 }, // Points
        { wch: 15 }, // Status
        { wch: 10 }, // Goals
        { wch: 10 }, // Assists
        { wch: 12 }, // CleanSheets
        { wch: 12 }, // YellowCards
        { wch: 10 }  // RedCards
      ];
      worksheet['!cols'] = wscols;

      // 4. สร้าง Workbook และนำ Worksheet ใส่เข้าไป
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Player Template");

      // 5. สั่งดาวน์โหลดไฟล์
      XLSX.writeFile(workbook, "Player_Import_Template.xlsx");

      // 6. แสดง Feedback ว่าดาวน์โหลดแล้ว
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (error) {
      console.error("Error creating template:", error);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ Template");
    }
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-7 relative border border-gray-100">
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
            
            {/* โซนอัปโหลดไฟล์ */}
            <Dropzone 
              onFileSelected={handleExcelDrop} 
              isLoading={isProcessing} 
            />

            {/* 🔥 อัปเกรดส่วนคำแนะนำ: เปลี่ยนจากการ Copy text เป็นปุ่มดาวน์โหลดไฟล์จริง */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    ต้องการไฟล์ตั้งต้น (Template) หรือไม่?
                  </h3>
                  <p className="text-xs text-blue-700/80 mt-1.5 leading-relaxed pr-4">
                    เพื่อป้องกันการพิมพ์หัวตารางผิดพลาด เราขอแนะนำให้ดาวน์โหลดไฟล์ Template ของระบบไปใช้งาน ซึ่งจะมีการจัด Format ที่ถูกต้องไว้ให้แล้ว
                  </p>
                </div>
                
                <button
                  onClick={handleDownloadTemplate}
                  className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all shrink-0 shadow-sm
                    ${isDownloaded 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'}`}
                >
                  {isDownloaded ? <CheckCircle className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  {isDownloaded ? 'ดาวน์โหลดสำเร็จ!' : 'โหลด Template'}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-blue-200/50 grid grid-cols-1 sm:grid-cols-2 text-[11px] gap-x-4 gap-y-2">
                <div className="flex items-start gap-1">
                  <span className="text-red-500 font-bold">*</span>
                  <p className="text-gray-600"><b className="text-gray-800">SKU:</b> รหัสอ้างอิงของนักเตะ (ห้ามซ้ำกัน)</p>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-red-500 font-bold">*</span>
                  <p className="text-gray-600"><b className="text-gray-800">Name:</b> ชื่อนักเตะ (ชื่อเต็ม หรือ ชื่อย่อ)</p>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-400 font-bold">•</span>
                  <p className="text-gray-600"><b className="text-gray-800">Position:</b> FWD, MID, DEF, GK</p>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-gray-400 font-bold">•</span>
                  <p className="text-gray-600"><b className="text-gray-800">Status:</b> active, injured, suspended</p>
                </div>
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
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลนักเตะ (Players)</h1>
        </div>
        <p className="text-gray-500">เพิ่ม, แก้ไข, อัปเดตสถิติ และราคาของนักเตะในระบบ Fantasy</p>
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
            onClick={closeModal} // คลิกพื้นหลังเพื่อปิด
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