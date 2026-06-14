import React from 'react';

export default function QuestSettingsInputs({ formData, handleChange }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">รับได้สูงสุด (ครั้ง / วัน)</label>
        <input
          type="number"
          name="maxClaimsPerUser"
          min="1"
          value={formData.maxClaimsPerUser}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">ระยะเวลารอกดซ้ำ (ชั่วโมง)</label>
        <input
          type="number"
          name="cooldownHours"
          min="0"
          step="0.5"
          value={formData.cooldownHours}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
        <div>
          <label className="block text-sm font-medium text-yellow-500 mb-1 flex items-center gap-1">
            💰 แจกรางวัล (Coins)
          </label>
          <input
            type="number"
            name="rewardBalls"
            min="0"
            required
            value={formData.rewardBalls}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="flex flex-col justify-center">
          <label className="flex items-center cursor-pointer mt-5">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
            />
            <span className="ml-2 text-sm font-medium text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Verified สปอนเซอร์
            </span>
          </label>
        </div>

        <div className="flex flex-col justify-center">
          <label className="flex items-center cursor-pointer mt-5">
            <div className="relative">
              <input type="checkbox" name="isActive" className="sr-only" checked={formData.isActive} onChange={handleChange} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              {formData.isActive ? 'สถานะ: เปิดใช้งาน' : 'สถานะ: ซ่อน'}
            </span>
          </label>
        </div>
      </div>
    </>
  );
}
