import React from 'react';

export default function GameSettings({ config, handleInputChange }) {
  if (!config) return null;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-3">การตั้งค่าเกมทั่วไป</h2>
      


      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนทีมที่เข้าร่วมแล้ว</label>
        <input
          type="number"
          value={config.totalJoinedTeams || 0}
          onChange={(e) => handleInputChange('totalJoinedTeams', parseInt(e.target.value))}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">รางวัลชวนเพื่อน (Referral Balls)</label>
        <input
          type="number"
          value={config.referralRewardBalls !== undefined ? config.referralRewardBalls : 50}
          onChange={(e) => handleInputChange('referralRewardBalls', parseInt(e.target.value))}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold text-slate-800 mb-3 text-sm">การตั้งค่าแชท (Global Chat)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">ค่าแชทปกติ (Balls)</label>
            <input
              type="number"
              value={config.chatConfig?.normalChatCost !== undefined ? config.chatConfig.normalChatCost : 2}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, normalChatCost: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">ค่า Super Chat (Balls)</label>
            <input
              type="number"
              value={config.chatConfig?.superChatCost !== undefined ? config.chatConfig.superChatCost : 15}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, superChatCost: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">เวลาปักหมุด (วินาที)</label>
            <input
              type="number"
              value={config.chatConfig?.superChatDuration !== undefined ? config.chatConfig.superChatDuration : 30}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, superChatDuration: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">+เพิ่มราคา Super Chat</label>
            <input
              type="number"
              value={config.chatConfig?.superChatCostIncrement !== undefined ? config.chatConfig.superChatCostIncrement : 5}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, superChatCostIncrement: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">เวลา Reset ราคา (วินาที)</label>
            <input
              type="number"
              value={config.chatConfig?.superChatResetTime !== undefined ? config.chatConfig.superChatResetTime : 60}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, superChatResetTime: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Cooldown แชทปกติฟรี (วินาที)</label>
            <input
              type="number"
              value={config.chatConfig?.normalChatFreeInterval !== undefined ? config.chatConfig.normalChatFreeInterval : 300}
              onChange={(e) => handleInputChange('chatConfig', { ...config.chatConfig, normalChatFreeInterval: parseInt(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>




      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div>
          <p className="font-bold text-slate-800">โหมดปิดโฆษณา (No Ads Mode)</p>
          <p className="text-xs text-slate-500">ซ่อนโฆษณาทั้งหมดในระบบ</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={config.isNoAdsMode || false}
            onChange={(e) => handleInputChange('isNoAdsMode', e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
}
