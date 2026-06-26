import React from 'react';
import { Bot, CheckCircle, Copy } from 'lucide-react';

export default function PlayerAiPrompt({ isPromptCopied, onCopyPrompt }) {
  return (
    <div className="mt-4 bg-gradient-to-br from-purple-50 to-fuchsia-50/50 border border-purple-100/50 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-600" />
            ใช้ AI ช่วยสร้างข้อมูลให้ไหม?
          </h3>
          <p className="text-xs text-purple-700/80 mt-1.5 leading-relaxed pr-4">
            คัดลอก Prompt สำเร็จรูปไปวางใน ChatGPT หรือ Gemini พร้อมแนบไฟล์ Template
            เพื่อให้ AI หาข้อมูลและจัดฟอร์แมตให้ทันที
          </p>
        </div>
        <button
          onClick={onCopyPrompt}
          className={`w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-all shrink-0 shadow-sm
            ${isPromptCopied ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white'}`}
        >
          {isPromptCopied ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {isPromptCopied ? 'คัดลอกแล้ว!' : 'คัดลอก Prompt'}
        </button>
      </div>
    </div>
  );
}
