import React from 'react';
import { ImageIcon } from 'lucide-react';

export default function ThemeUploadField({
  title,
  description,
  currentUrl,
  selectedFile,
  onFileSelect,
  accept = 'image/*',
  isObjectPreview = false,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <ImageIcon size={18} className="text-slate-400" /> {title}
      </h3>

      <div
        className={`w-full h-48 rounded-xl mb-4 overflow-hidden border-2 border-dashed relative group flex items-center justify-center ${isObjectPreview ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
      >
        {selectedFile || currentUrl ? (
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : currentUrl}
            alt="Preview"
            className={
              isObjectPreview
                ? 'w-32 h-32 object-contain animate-[bounce_3s_ease-in-out_infinite]'
                : 'w-full h-full object-cover'
            }
          />
        ) : (
          <span
            className={`${isObjectPreview ? 'text-slate-500' : 'text-slate-400'} text-sm font-bold`}
          >
            ยังไม่มีรูปภาพ
          </span>
        )}
      </div>

      <label className="block w-full bg-slate-50 border border-slate-200 text-slate-600 text-center font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
        {description}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files[0])}
        />
      </label>
    </div>
  );
}
