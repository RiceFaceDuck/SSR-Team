import React, { useEffect, useState } from 'react';
import { RewardCard } from './RewardCard'; 
import { useRedeemStore } from '../../store/useRedeemStore';
import { useUserStore } from '../../store/useUserStore';
import ConfettiEffect from '../../components/common/ConfettiEffect';
import { Sparkles, Store, PackageOpen, X, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RedeemScreen() {
  const navigate = useNavigate();
  
  // ดึง State และ Action จาก Store
  const { rewards, isLoading, fetchRewards } = useRedeemStore();
  const { balls } = useUserStore();

  // Local State สำหรับจัดการ Gamification (พลุ & ป๊อปอัป)
  const [confetti, setConfetti] = useState({ isActive: false, type: 'burst' });
  const [wonItemModal, setWonItemModal] = useState(null);

  // สั่งดึงข้อมูลจาก Database ทุกครั้งที่เข้ามาหน้านี้
  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // ฟังก์ชันนี้จะถูกเรียกจาก RewardCard เมื่อทำการแลกหรือสุ่มสำเร็จ
  const handleRedeemSuccess = (result) => {
    if (result.wonItem) {
      // 🎁 กรณีสุ่ม Gacha ได้ของ
      setConfetti({ isActive: true, type: 'fireworks' }); // ยิงพลุชุดใหญ่
      setWonItemModal(result.wonItem); // เปิด Modal โชว์ของที่ได้
      
      // สั่นเตือนความดีใจ
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
         window.navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } else {
      // ✅ กรณีแลกของปกติสำเร็จ
      setConfetti({ isActive: true, type: 'burst' }); // ยิงพลุตู้มเดียว
      
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100]);
      }
    }
  };

  // แยกประเภทของรางวัลเพื่อนำไปแสดงผลคนละโซน
  const gachaRewards = rewards.filter(r => r.type === 'gacha');
  const normalRewards = rewards.filter(r => r.type !== 'gacha');

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 max-w-4xl mx-auto min-h-screen">
      
      {/* 🎆 วางระบบพลุกระดาษ */}
      <ConfettiEffect 
        isActive={confetti.isActive} 
        type={confetti.type}
        duration={confetti.type === 'fireworks' ? 4000 : 2500}
        onComplete={() => setConfetti({ isActive: false, type: 'burst' })} 
      />

      {}
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8 bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shadow-inner border border-amber-100">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-0.5 tracking-tight">ร้านค้ารางวัล</h2>
            <p className="text-slate-500 font-medium text-xs">
              สะสม <span className="font-bold text-amber-500">Balls ⚽</span> เพื่อแลกรับรางวัลและแพ็คเกจนักเตะสุดพิเศษ!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2.5">
          {/* กล่องแสดงยอด Balls (Premium UI) */}
          <div className="bg-white text-slate-800 px-4 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 border border-slate-200 hover:scale-105 transition-transform cursor-pointer">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ยอดเงิน</span>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg text-amber-500 leading-none">{balls?.toLocaleString() || 0}</span>
              <span className="text-amber-500 drop-shadow-sm leading-none">⚽</span>
            </div>
          </div>
          
          {/* ปุ่มไปดูประวัติ (ลิงก์ไปหน้า Profile เพราะเราทำ History ไว้ที่นั่นแล้ว) */}
          <button 
            onClick={() => navigate('/profile')}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-1"
          >
            <RefreshCw size={10} /> ประวัติการใช้จ่าย
          </button>
        </div>
      </div>

      {}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="font-medium text-sm">กำลังจัดเรียงสินค้าลงชั้นวาง...</p>
        </div>
      ) : rewards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center gap-4">
          <PackageOpen size={48} className="text-slate-300" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">ยังไม่มีสินค้าในร้านค้า</h3>
            <p className="text-slate-500 text-sm mt-1">แอดมินกำลังเตรียมของรางวัลเจ๋งๆ ให้คุณอยู่ อดใจรอหน่อยนะ!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {}
          {/* 🌟 โซนกาชา (Gacha Zone) - เด่นพิเศษ */}
          {gachaRewards.length > 0 && (
            <section className="relative">
              <div className="absolute inset-0 bg-amber-50/50 rounded-[2.5rem] -m-6 p-6 -z-10 border border-amber-100/50"></div>
              
              <div className="flex items-center gap-2 mb-4 px-2">
                <Sparkles className="text-amber-500" size={20} />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">โซนเสี่ยงดวง (Mystery Box)</h3>
                <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">Hot</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gachaRewards.map((reward) => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    onSuccess={handleRedeemSuccess} 
                  />
                ))}
              </div>
            </section>
          )}

          {}
          {/* 🎁 โซนแลกของรางวัลปกติ (Normal Zone) */}
          {normalRewards.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 px-2">
                <PackageOpen className="text-indigo-500" size={20} />
                <h3 className="text-lg font-black text-slate-800 tracking-tight">ของรางวัลพรีเมียม (Redeem)</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {normalRewards.map((reward) => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    onSuccess={handleRedeemSuccess} 
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {}
      {/* 🏆 Custom Modal สำหรับแจ้งเตือนเวลาเปิดกาชาได้ของ */}
      {wonItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300 flex flex-col relative border-4 border-amber-400">
            
            {/* โบว์ตกแต่ง */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-amber-400 rounded-b-xl flex justify-center items-end pb-1 shadow-inner">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Jackpot</span>
            </div>

            <div className="p-8 text-center pt-10">
              <h3 className="text-2xl font-black text-slate-800 mb-2">ยินดีด้วย! 🎉</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">คุณเปิดกล่องสุ่มได้รับ</p>
              
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-inner mb-6 transform hover:scale-105 transition-transform">
                <div className="text-5xl mb-3 drop-shadow-md">🎁</div>
                <h4 className="font-black text-lg text-amber-600 leading-tight">
                  {wonItemModal.name || 'ไอเทมปริศนา'}
                </h4>
                {wonItemModal.rarity && (
                  <span className="inline-block mt-2 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    ระดับ: {wonItemModal.rarity}
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setWonItemModal(null)}
                className="w-full px-4 py-3.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                รับรางวัลและปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}