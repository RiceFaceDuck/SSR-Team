import React, { useState } from 'react';
import { Users, X } from 'lucide-react';

import PlayerList from './views/PlayerList';
import PlayerDetails from './views/PlayerDetails';
import PlayerManualForm from './components/PlayerManualForm';
import ExcelPreview from './components/ExcelPreview';
import Dropzone from '../../components/ui/Dropzone';
import PlayerValueManager from './views/PlayerValueManager';
import PlayerImportTools from './components/PlayerImportTools';

import { usePlayers } from './hooks/usePlayers';
import { parseExcelFile } from './utils/excelParser';

const PlayerFeature = () => {
  const { saveManualPlayer, addMultiplePlayers } = usePlayers();

  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const closeModal = () => {
    if (!isProcessing) {
      setModal({ isOpen: false, type: null, data: null });
    }
  };

  const openManualForm = (player = null) =>
    setModal({ isOpen: true, type: 'manual', data: player });
  const openImportExcel = () => setModal({ isOpen: true, type: 'import-drop', data: null });
  const openPlayerDetails = (player) => setModal({ isOpen: true, type: 'details', data: player });
  const openValueEngine = () => setModal({ isOpen: true, type: 'value-engine', data: null });

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
          <PlayerImportTools 
            onFileSelected={handleExcelDrop} 
            isLoading={isProcessing} 
            onClose={closeModal} 
          />
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
      default:
        return null;
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              จัดการข้อมูลนักเตะ (Players)
            </h1>
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
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerFeature;
