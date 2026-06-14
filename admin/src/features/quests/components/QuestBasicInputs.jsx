import React from 'react';

export default function QuestBasicInputs({ formData, handleChange }) {
  return (
    <>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">หัวข้อโปรโมชั่น (Title)</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="เช่น สมัครสมาชิกใหม่ รับฟรี 50 เหรียญ!"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300 mb-1">รายละเอียดเงื่อนไข (Description)</label>
        <textarea
          name="description"
          rows="2"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="อธิบายเงื่อนไขที่ผู้เล่นต้องทำ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">ป้ายกำกับที่มา (Platform)</label>
        <select
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Website">🌐 Website</option>
          <option value="Shopee">🛍️ Shopee</option>
          <option value="Lazada">🛒 Lazada</option>
          <option value="Facebook">📘 Facebook</option>
          <option value="YouTube">📺 YouTube</option>
          <option value="TikTok">🎵 TikTok</option>
          <option value="Line">💬 LINE</option>
          <option value="Official">⭐ Official</option>
          <option value="Other">🏷️ Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">ลิงก์ปลายทาง (Target URL)</label>
        <input
          type="url"
          name="targetUrl"
          required
          value={formData.targetUrl}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://sponsor.com/..."
        />
      </div>
    </>
  );
}
