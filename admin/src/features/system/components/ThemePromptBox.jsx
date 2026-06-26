import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ThemePromptBox() {
  const promptText =
    'Generate a widescreen 16:9 landscape image (1920x1080). EXTREME COMPOSITION RULE: You must treat the exact middle of the image as a strict vertical smartphone screen. Absolutely ALL subjects, characters, and typography MUST be constrained perfectly inside this narrow, central vertical column. The left and right horizontal sides MUST be completely empty, containing ONLY a blurred background.';

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
      <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-2">
        <Sparkles size={16} /> โครงสร้าง Prompt สำหรับสั่ง AI (Midjourney/Gemini)
      </h3>
      <p className="text-xs text-indigo-600 mb-3">
        ก๊อปปี้ข้อความด้านล่างนี้ไปต่อท้าย Prompt ของคุณ เพื่อบังคับให้ AI
        วาดภาพและจัดตำแหน่งให้อยู่ตรงกลางเป๊ะๆ (ป้องกันปัญหาขอบซ้ายขวาโดนตัดบนมือถือ)
      </p>
      <div className="relative">
        <textarea
          readOnly
          className="w-full text-[11px] font-mono text-slate-700 bg-white border border-indigo-200 rounded-lg p-3 resize-none h-24 outline-none"
          value={promptText}
        />
        <button
          onClick={() => {
            navigator.clipboard.writeText(promptText);
            alert('คัดลอก Prompt ข้อจำกัดการออกแบบเรียบร้อยแล้ว!');
          }}
          className="absolute top-2 right-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
        >
          คัดลอก Prompt
        </button>
      </div>
    </div>
  );
}
