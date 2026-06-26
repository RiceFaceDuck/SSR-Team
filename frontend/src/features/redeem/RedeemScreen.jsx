import React, { useEffect, useState } from 'react';
import { RewardCard } from './RewardCard';
import { useRedeemStore } from '../../store/useRedeemStore';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';
import ConfettiEffect from '../../components/common/ConfettiEffect';
import { Sparkles, PackageOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RedeemHeader from './components/RedeemHeader';
import WonItemModal from './components/WonItemModal';

export default function RedeemScreen() {
  const navigate = useNavigate();

  const { rewards, isLoading, fetchRewards } = useRedeemStore();
  const { balls } = useUserStore();
  const themeConfig = useGameStore((state) => state.themeConfig);

  const [confetti, setConfetti] = useState({ isActive: false, type: 'burst' });
  const [wonItemModal, setWonItemModal] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleRedeemSuccess = (result) => {
    if (result.wonItem) {
      setConfetti({ isActive: true, type: 'fireworks' });
      setWonItemModal(result.wonItem);

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } else {
      setConfetti({ isActive: true, type: 'burst' });

      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100]);
      }
    }
  };

  const gachaRewards = rewards.filter((r) => r.type === 'gacha');
  const normalRewards = rewards.filter((r) => r.type !== 'gacha');

  return (
    <div
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 min-h-screen bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})`,
      }}
    >
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <ConfettiEffect
          isActive={confetti.isActive}
          type={confetti.type}
          duration={confetti.type === 'fireworks' ? 4000 : 2500}
          onComplete={() => setConfetti({ isActive: false, type: 'burst' })}
        />

        <RedeemHeader balls={balls} onHistoryClick={() => navigate('/profile')} />

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
              <p className="text-slate-500 text-sm mt-1">
                แอดมินกำลังเตรียมของรางวัลเจ๋งๆ ให้คุณอยู่ อดใจรอหน่อยนะ!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {gachaRewards.length > 0 && (
              <section className="relative">
                <div className="absolute inset-0 bg-amber-50/50 rounded-[2.5rem] -m-6 p-6 -z-10 border border-amber-100/50"></div>

                <div className="flex items-center gap-2 mb-4 px-2">
                  <Sparkles className="text-amber-500" size={20} />
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    โซนเสี่ยงดวง (Mystery Box)
                  </h3>
                  <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 uppercase tracking-wider">
                    Hot
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {gachaRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} onSuccess={handleRedeemSuccess} />
                  ))}
                </div>
              </section>
            )}

            {normalRewards.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <PackageOpen className="text-indigo-500" size={20} />
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">
                    ของรางวัลพรีเมียม (Redeem)
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {normalRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} onSuccess={handleRedeemSuccess} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <WonItemModal item={wonItemModal} onClose={() => setWonItemModal(null)} />
      </div>
    </div>
  );
}
