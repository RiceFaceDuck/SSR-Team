import React from 'react';

export default function CardBasicInfoFields({ formData, handleChange }) {
  return (
    <>
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            ไอคอน
          </label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="w-full text-center text-xl p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
            placeholder="⚡"
            maxLength={2}
            required
          />
        </div>
        <div className="col-span-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            ชื่อการ์ด
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
            placeholder="เช่น กัปตันจอมแบก"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            ระดับหายาก
          </label>
          <select
            name="rarity"
            value={formData.rarity}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg outline-none transition-all font-bold text-sm shadow-sm backdrop-blur-sm
              ${formData.rarity === 'COMMON' ? 'bg-slate-50/80 text-slate-600 border-slate-200' : ''}
              ${formData.rarity === 'RARE' ? 'bg-blue-50/80 text-blue-700 border-blue-200' : ''}
              ${formData.rarity === 'EPIC' ? 'bg-purple-50/80 text-purple-700 border-purple-200' : ''}
              ${formData.rarity === 'LEGENDARY' ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300' : ''}
            `}
          >
            <option value="COMMON">COMMON (หาง่าย)</option>
            <option value="RARE">RARE (หายาก)</option>
            <option value="EPIC">EPIC (อีปิค)</option>
            <option value="LEGENDARY">LEGENDARY (ตำนาน)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            คำอธิบาย
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
            rows={2}
            placeholder="เช่น คูณ 3 คะแนนสัปดาห์นี้"
            required
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            ราคา (Balls)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold">
              🪙
            </span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full p-2 pl-8 border border-slate-200 rounded-lg text-amber-600 font-black focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
}
