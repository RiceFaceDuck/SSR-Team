import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { gameweekCalculationService } from '../../../services/engine/gameweekCalculationService';
import { leaderboardEngine } from '../../../services/engine/leaderboardEngine';
import { apiFootballService } from '../../../services/api/apiFootballService';
import { 
  PlayCircle, 
  Lock, 
  Activity, 
  Calculator, 
  RefreshCw,
  Trophy,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processGwId, setProcessGwId] = useState('GW1');
  const [gwHistory, setGwHistory] = useState([]);
  
  // States for API Gameweeks
  const [apiGameweeks, setApiGameweeks] = useState([]);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isLoadingApiGw, setIsLoadingApiGw] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchHistory();
    loadApiGameweeks();
  }, []);

  const loadApiGameweeks = async () => {
    try {
      setIsLoadingApiGw(true);
      const rounds = await apiFootballService.fetchAvailableGameweeks();
      // rounds จะหน้าตาประมาณ ["Regular Season - 1", "Regular Season - 2", ...]
      // แปลงเป็นรูปแบบที่เราใช้ในระบบ เช่น GW1, GW2
      const formattedRounds = rounds.map(r => {
        const match = r.match(/\d+/);
        const num = match ? match[0] : '';
        return num ? `GW${num}` : r;
      });
      // ลบตัวซ้ำ (ถ้ามี)
      const uniqueRounds = [...new Set(formattedRounds)];
      
      // เรียงลำดับตัวเลข
      uniqueRounds.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      setApiGameweeks(uniqueRounds);
    } catch (err) {
      console.error('Error fetching API gameweeks:', err);
      // ถ้าโหลดไม่สำเร็จ ให้บังคับเป็นโหมดพิมพ์เอง
      setIsAutoMode(false);
    } finally {
      setIsLoadingApiGw(false);
    }
  };

  const fetchHistory = async () => {
    try {
      // ดึงประวัติการบันทึก Gameweek
      const historyRef = collection(db, 'public_data', 'gameweeks', 'weeks');
      const q = query(historyRef); // อาจจะเอาทั้งหมดมาโชว์ 5 อันดับล่าสุด
      const snap = await getDocs(q);
      const historyData = [];
      snap.forEach(doc => {
        historyData.push({ id: doc.id, ...doc.data() });
      });
      // เรียงจากล่าสุด (สมมติใช้ id หรือ updatedAt)
      historyData.sort((a, b) => b.id.localeCompare(a.id));
      setGwHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    } catch (err) {
      console.error('Error fetching system_config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSystemState = async (field, value) => {
    if (!config) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, { [field]: value });
      setConfig(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error('Error updating state:', err);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessGameweek = async () => {
    if (!processGwId) return alert('กรุณาระบุ Gameweek ที่ต้องการบันทึก');
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าจะประมวลผลคะแนนและบันทึกผลของ ${processGwId}? (การกระทำนี้จะเปลี่ยนอันดับผู้เล่น)`)) return;
    
    try {
      setIsProcessing(true);
      await gameweekCalculationService.processGameweek(processGwId);
      await leaderboardEngine.updateLeaderboardRanks();
      alert(`บันทึกผลการแข่งขัน ${processGwId} สำเร็จ!`);
      fetchHistory(); // อัปเดตประวัติ
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการคำนวณและบันทึก กรุณาดู Console');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const isMarketOpen = config?.isMarketOpen ?? true;
  const currentGW = config?.currentGameweek || 'WEEK 1';

  // คำนวณ Current Step ของ Loop
  // Step 1: ตลาดเปิด (isMarketOpen = true)
  // Step 2: ตลาดปิด รอผล (isMarketOpen = false)
  // Step 3 และ 4 แอดมินต้องเป็นคนเข้าไปทำในหน้า Gameweek
  let currentStep = isMarketOpen ? 1 : 2;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={160} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Activity className="text-blue-400" size={32} />
            GAMEWEEK LIFECYCLE MANAGER
          </h1>
          <p className="text-blue-200 font-medium max-w-2xl">
            แผงควบคุมหลักสำหรับจัดการวัฏจักรของเกมในแต่ละสัปดาห์ ควบคุมสถานะและเข้าถึงเครื่องมือคำนวณได้อย่างรวดเร็ว
          </p>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Quick Status & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isMarketOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="text-slate-400" size={20} />
              สถานะปัจจุบัน
            </h2>

            <div className="space-y-6">
              {/* Gameweek Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-600">รอบการแข่งขัน (Gameweek)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Auto (API)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isAutoMode}
                        onChange={(e) => setIsAutoMode(e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isAutoMode ? (
                    <select
                      value={config?.currentGameweek || ''}
                      onChange={(e) => setConfig({ ...config, currentGameweek: e.target.value })}
                      disabled={isLoadingApiGw}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {isLoadingApiGw ? <option>กำลังโหลด...</option> : <option value="">เลือกสัปดาห์ (GW)</option>}
                      {apiGameweeks.map((gw, idx) => (
                        <option key={idx} value={gw}>สัปดาห์ที่ {gw.replace(/\D/g, '')} ({gw})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={config?.currentGameweek || ''}
                      onChange={(e) => setConfig({ ...config, currentGameweek: e.target.value })}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                      placeholder="พิมพ์ชื่อรอบด้วยตัวเอง (เช่น GW1)"
                    />
                  )}
                  
                  <button 
                    onClick={() => updateSystemState('currentGameweek', config.currentGameweek)}
                    disabled={isUpdating || !config?.currentGameweek}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                    title="บันทึก Gameweek ลงระบบ"
                  >
                    <RefreshCw size={20} className={isUpdating ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Market Toggle */}
              <div className="p-4 rounded-2xl border-2 transition-colors duration-300 flex items-center justify-between cursor-pointer"
                   onClick={() => updateSystemState('isMarketOpen', !isMarketOpen)}
                   style={{ borderColor: isMarketOpen ? '#10b981' : '#ef4444', backgroundColor: isMarketOpen ? '#ecfdf5' : '#fef2f2' }}
              >
                <div>
                  <p className={`font-black text-lg ${isMarketOpen ? 'text-emerald-700' : 'text-red-700'}`}>
                    ตลาด{isMarketOpen ? 'เปิด' : 'ปิด'}
                  </p>
                  <p className={`text-xs font-bold ${isMarketOpen ? 'text-emerald-600/70' : 'text-red-600/70'}`}>
                    {isMarketOpen ? 'ผู้เล่นสามารถจัดทีมได้' : 'ล็อกทีม รอผลแข่ง'}
                  </p>
                </div>
                
                {/* Switch UI */}
                <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors duration-300 ${isMarketOpen ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isMarketOpen ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

              {/* Registration Toggle */}
              <div className="p-4 rounded-2xl border transition-colors duration-300 flex items-center justify-between cursor-pointer border-slate-200 hover:bg-slate-50"
                   onClick={() => updateSystemState('isRegistrationOpen', !(config?.isRegistrationOpen ?? true))}
              >
                <div>
                  <p className="font-bold text-slate-800">เปิดลงทะเบียนเข้าแข่งขัน</p>
                  <p className="text-xs text-slate-500">อนุญาตการสร้างทีมใหม่</p>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${(config?.isRegistrationOpen ?? true) ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${(config?.isRegistrationOpen ?? true) ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right: The Loop Pipeline */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
            <h2 className="text-xl font-black text-slate-800 mb-8 text-center md:text-left">วัฏจักรเกม (The Gameweek Loop)</h2>
            
            <div className="relative">
              {/* Vertical line for desktop */}
              <div className="hidden md:block absolute left-8 top-8 bottom-8 w-1 bg-slate-100 rounded-full"></div>

              <div className="space-y-6 relative">
                
                {/* Step 1 */}
                <div className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-2xl transition-all ${currentStep === 1 ? 'bg-blue-50 border-2 border-blue-200 shadow-md transform scale-[1.02]' : 'opacity-60 grayscale'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <PlayCircle size={28} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="font-black text-lg text-slate-800">1. เตรียมความพร้อม & เปิดตลาด</h3>
                    <p className="text-sm font-medium text-slate-600 mt-1">
                      แอดมินอัปเดตสัปดาห์เป็น <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md mx-1">{currentGW}</span> และตั้งค่าสถานะตลาดให้ <strong>"เปิด"</strong> เพื่อให้ผู้เล่นเข้ามาซื้อตัวและจัดทีม
                    </p>
                  </div>
                  {currentStep === 1 && (
                    <div className="md:self-center shrink-0">
                       <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl text-sm animate-pulse">กำลังอยู่ในช่วงนี้...</span>
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-2xl transition-all ${currentStep === 2 ? 'bg-rose-50 border-2 border-rose-200 shadow-md transform scale-[1.02]' : 'opacity-60 grayscale'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${currentStep === 2 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Lock size={28} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="font-black text-lg text-slate-800">2. ปิดตลาด (Deadline Passed)</h3>
                    <p className="text-sm font-medium text-slate-600 mt-1">
                      เมื่อถึงกำหนด แอดมินตั้งค่าตลาดให้ <strong>"ปิด"</strong> ผู้เล่นจะไม่สามารถแก้ไขทีมได้อีก จากนั้นรอจนกว่าการแข่งขันจริงในสนามจะจบลง
                    </p>
                  </div>
                  {currentStep === 2 && (
                    <div className="md:self-center shrink-0 flex flex-col gap-2">
                       <span className="px-4 py-2 bg-rose-100 text-rose-700 font-bold rounded-xl text-sm text-center animate-pulse">กำลังอยู่ในช่วงนี้</span>
                    </div>
                  )}
                </div>

                {/* Step 3 */}
                <div className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-2xl transition-all ${currentStep === 2 ? 'bg-amber-50 border border-amber-200 hover:shadow-md' : 'opacity-60 grayscale'}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${currentStep === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Activity size={28} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="font-black text-lg text-slate-800">3. อัปเดตสถิตินักเตะ</h3>
                    <p className="text-sm font-medium text-slate-600 mt-1">
                      การแข่งขันจบ แอดมินเข้าไประบุสถิติให้นักเตะแต่ละคน (Goals, Assists, Clean Sheets) ในหน้า Game Engine
                    </p>
                  </div>
                  {currentStep === 2 && (
                    <div className="md:self-center shrink-0">
                       <button onClick={() => navigate('/gameweek')} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/30">
                         จัดการสถิติ <ArrowRight size={16} />
                       </button>
                    </div>
                  )}
                </div>

                {/* Step 4 */}
                <div className={`relative flex flex-col items-start gap-4 p-5 rounded-2xl transition-all ${currentStep === 2 ? 'bg-emerald-50 border-2 border-emerald-300 shadow-md transform scale-[1.02]' : 'opacity-60 grayscale'}`}>
                  <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${currentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Calculator size={28} />
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h3 className="font-black text-lg text-slate-800">4. ประมวลผลคะแนน & แจกรางวัล</h3>
                      <p className="text-sm font-medium text-slate-600 mt-1">
                        เลือกสัปดาห์ที่ต้องการบันทึกผล และกดคำนวณคะแนนรวม จากนั้นกลับไป <strong>เปิดตลาด</strong> สำหรับรอบถัดไป
                      </p>
                    </div>
                  </div>
                  
                  {/* Process Action */}
                  {currentStep === 2 && (
                    <div className="w-full mt-2 bg-white rounded-xl p-4 border border-emerald-100 flex flex-col md:flex-row items-end gap-4 shadow-sm">
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-emerald-700">ระบุตำแหน่งบันทึกผล (Gameweek ID)</label>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-emerald-600">Auto</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={isAutoMode}
                                onChange={(e) => setIsAutoMode(e.target.checked)}
                              />
                              <div className="w-6 h-3 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                          </div>
                        </div>
                        
                        {isAutoMode ? (
                          <select
                            value={processGwId}
                            onChange={(e) => setProcessGwId(e.target.value)}
                            disabled={isLoadingApiGw}
                            className="w-full border border-emerald-200 rounded-lg px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="">เลือกสัปดาห์</option>
                            {apiGameweeks.map((gw, idx) => (
                              <option key={idx} value={gw}>บันทึกคะแนนเป็น {gw}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={processGwId}
                            onChange={(e) => setProcessGwId(e.target.value)}
                            placeholder="เช่น GW1"
                            className="w-full border border-emerald-200 rounded-lg px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                          />
                        )}
                      </div>
                      <button 
                        onClick={handleProcessGameweek}
                        disabled={isProcessing}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-emerald-600/30 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Calculator size={20} />}
                        {isProcessing ? 'กำลังคำนวณ...' : 'บันทึกผลการแข่งขัน'}
                      </button>
                    </div>
                  )}

                  {/* History List */}
                  {gwHistory.length > 0 && currentStep === 2 && (
                    <div className="w-full mt-2 text-sm">
                      <p className="font-bold text-slate-700 mb-2">ประวัติการบันทึกผลก่อนหน้านี้:</p>
                      <div className="space-y-2">
                        {gwHistory.slice(0, 3).map(history => (
                          <div key={history.id} className="flex justify-between items-center bg-white border border-emerald-100 px-4 py-2 rounded-lg">
                            <span className="font-bold text-slate-700">{history.id}</span>
                            <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md flex items-center gap-1">
                              <Activity size={12} /> {history.status === 'completed' ? 'เรียบร้อยดี (Completed)' : history.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
