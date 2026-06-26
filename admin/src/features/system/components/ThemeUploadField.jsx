import React from 'react';
import { Loader2, UploadCloud, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ThemeUploadField({
  label,
  themeKey,
  placeholder,
  adviceText,
  config,
  handleThemeChange,
  uploadingKey,
  handleFileUpload,
  handleSelectHistory,
}) {
  const value = config?.themeConfig?.[themeKey] || '';
  const isUploading = uploadingKey === themeKey;
  const historyKey = `${themeKey}History`;
  const historyList = config?.themeConfig?.[historyKey] || [];

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <label className="block text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
        {themeKey === 'floatingObjectUrl' ? (
          <Sparkles size={16} className="text-amber-500" />
        ) : (
          <ImageIcon size={16} className="text-blue-500" />
        )}
        {label}
      </label>

      <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{adviceText}</p>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => handleThemeChange(themeKey, e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          disabled={isUploading}
        />

        <label
          className={`flex-shrink-0 cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${isUploading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}`}
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {isUploading ? 'อัปโหลด...' : 'อัปโหลดภาพ'}
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg, image/png, image/webp"
            onChange={(e) => handleFileUpload(e, themeKey)}
            disabled={isUploading}
          />
        </label>
      </div>

      {value && (
        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black/5 relative inline-block">
          <img src={value} alt="Preview" className="h-20 object-contain" />
        </div>
      )}

      {historyList.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2 font-medium">
            🕒 ประวัติรูปภาพที่เคยอัปโหลด (คลิกเพื่อใช้งานทันที):
          </p>
          <div className="flex gap-2 flex-wrap">
            {historyList.map((historyUrl, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectHistory(themeKey, historyUrl)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all hover:opacity-100 ${value === historyUrl ? 'border-blue-500 shadow-md opacity-100' : 'border-transparent opacity-60 hover:border-slate-300'}`}
                title="คลิกเพื่อนำกลับมาใช้"
              >
                <img src={historyUrl} alt="History" className="h-12 w-20 object-cover bg-black/5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
