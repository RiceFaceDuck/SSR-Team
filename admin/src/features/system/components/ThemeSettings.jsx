import React from 'react';

export default function ThemeSettings({ config, handleThemeChange, handleSetDefaultTheme }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-lg font-bold text-slate-800">การตั้งค่าธีม (Theme Management)</h2>
        <button 
          onClick={handleSetDefaultTheme}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3 rounded-lg"
        >
          โหลด ธีมเริ่มต้น
        </button>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">พื้นหลังหน้า Login (URL)</label>
        <input
          type="text"
          value={config?.themeConfig?.loginBackgroundUrl || ''}
          onChange={(e) => handleThemeChange('loginBackgroundUrl', e.target.value)}
          placeholder="https://..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">ภาพตกแต่งลอยไปมา (Floating Object)</label>
        <input
          type="text"
          value={config?.themeConfig?.floatingObjectUrl || ''}
          onChange={(e) => handleThemeChange('floatingObjectUrl', e.target.value)}
          placeholder="https://..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">พื้นหลังหน้าตลาด (Market Background URL)</label>
        <input
          type="text"
          value={config?.themeConfig?.marketBackgroundUrl || ''}
          onChange={(e) => handleThemeChange('marketBackgroundUrl', e.target.value)}
          placeholder="https://..."
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>
      
      <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm mt-4 border border-blue-100">
        <p className="font-bold mb-1">💡 ข้อมูลธีมปัจจุบัน</p>
        <p>ระบบตลาดและแผนการเล่นถูกปรับเป็นสีกรมท่า (Dark Blue) และปุ่มกดเป็นสีฟ้า/เทาแล้ว (Hardcoded เพื่อความลื่นไหล) การเปลี่ยนภาพพื้นหลังด้านบนจะเห็นผลทันที</p>
      </div>
    </div>
  );
}
