import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Settings, Save, AlertCircle } from 'lucide-react';

export default function SystemSettings() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      // ใช้ ID ตามที่ระบุใน Security Rules ของระบบเก่า (public_data/system_config)
      const docRef = doc(db, 'public_data', 'system_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        setError('ไม่พบข้อมูล System Config');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, config);
      alert('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || {}),
        [field]: value
      }
    }));
  };

  const handleSetDefaultTheme = () => {
    // บันทึก Theme ปัจจุบันให้เป็นค่า Default (Red/Dark Blue theme)
    setConfig(prev => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || {}),
        loginBackgroundUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000',
        marketBackgroundUrl: 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000',
        floatingObjectUrl: ''
      }
    }));
    alert('โหลดค่า Default Theme เรียบร้อย กรุณากดปุ่มบันทึก');
  };

  if (isLoading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">ตั้งค่าระบบ (System Settings)</h1>
            <p className="text-slate-500 font-medium">จัดการสถานะเกมและการออกแบบหน้าตา</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ส่วนการตั้งค่าเกม */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3">การตั้งค่าเกมทั่วไป</h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">สัปดาห์ปัจจุบัน (Gameweek)</label>
              <input
                type="text"
                value={config.currentGameweek || ''}
                onChange={(e) => handleInputChange('currentGameweek', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

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
                <p className="font-bold text-slate-800">ตลาดซื้อขาย (Market)</p>
                <p className="text-xs text-slate-500">เปิด/ปิด ให้ผู้เล่นซื้อขายนักเตะ</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={config.isMarketOpen || false}
                  onChange={(e) => handleInputChange('isMarketOpen', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
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

          {/* ส่วนตั้งค่าธีม */}
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
                value={config.themeConfig?.loginBackgroundUrl || ''}
                onChange={(e) => handleThemeChange('loginBackgroundUrl', e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">ภาพตกแต่งลอยไปมา (Floating Object)</label>
              <input
                type="text"
                value={config.themeConfig?.floatingObjectUrl || ''}
                onChange={(e) => handleThemeChange('floatingObjectUrl', e.target.value)}
                placeholder="https://..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">พื้นหลังหน้าตลาด (Market Background URL)</label>
              <input
                type="text"
                value={config.themeConfig?.marketBackgroundUrl || ''}
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
        </div>
      )}
    </div>
  );
}
