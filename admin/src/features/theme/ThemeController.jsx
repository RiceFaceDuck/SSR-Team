import React from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Palette } from 'lucide-react';
import { useThemeUploadLogic } from './hooks/useThemeUploadLogic';
import ThemeUploadField from './components/ThemeUploadField';

export default function ThemeController() {
  const {
    isLoading,
    isUploading,
    statusMsg,
    currentTheme,
    selectedBgFile,
    setSelectedBgFile,
    selectedObjFile,
    setSelectedObjFile,
    handleSaveTheme,
  } = useThemeUploadLogic();

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 font-bold animate-pulse">
        กำลังโหลดข้อมูลธีม...
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2">
          <Palette className="text-indigo-600" /> จัดการธีม & รูปภาพ (Login Screen)
        </h2>
        <p className="text-sm text-slate-500">
          อัปโหลดภาพพื้นหลังและไอคอนลอยได้ ภาพจะถูกเก็บไว้ที่ Google Drive อัตโนมัติ
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
            statusMsg.type === 'error'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : statusMsg.type === 'success'
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}
        >
          {statusMsg.type === 'loading' ? (
            <Loader2 className="animate-spin" size={20} />
          ) : statusMsg.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThemeUploadField
          title="ภาพพื้นหลัง (Background)"
          description="เลือกไฟล์ใหม่ (JPG/PNG)"
          currentUrl={currentTheme.loginBackgroundUrl}
          selectedFile={selectedBgFile}
          onFileSelect={setSelectedBgFile}
        />
        <ThemeUploadField
          title="ไอคอนลอยได้ (Floating Object)"
          description="เลือกไฟล์ใหม่ (PNG พื้นใส/GIF)"
          currentUrl={currentTheme.floatingObjectUrl}
          selectedFile={selectedObjFile}
          onFileSelect={setSelectedObjFile}
          isObjectPreview={true}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSaveTheme}
          disabled={isUploading || (!selectedBgFile && !selectedObjFile)}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isUploading ? 'กำลังอัปเดตระบบ...' : 'บันทึกและอัปเดตระบบ'}
        </button>
      </div>
    </div>
  );
}
