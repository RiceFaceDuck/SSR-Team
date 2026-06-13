import React, { useState, useEffect } from 'react';
import { STYLES } from '../../config/theme';
import { Trophy, Star, Medal } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function LeaderboardScreen() {
  const themeConfig = useGameStore(state => state.themeConfig);
  const user = useGameStore(state => state.user);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('rank', 'asc'),
          limit(50)
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.hasJoinedGame) {
            list.push({ id: doc.id, ...data });
          }
        });
        setLeaders(list);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-amber-500 bg-amber-50 border-amber-200';
    if (rank === 2) return 'text-slate-400 bg-slate-100 border-slate-300';
    if (rank === 3) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative flex flex-col"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
    >
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 pt-2 pb-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1 flex items-center gap-2">
              <Trophy className="text-amber-500" size={32} /> RANK.
            </h2>
            <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold leading-none uppercase">ซีซั่นนี้</span>
              <span className="text-sm font-black text-indigo-600 leading-none mt-1">GLOBAL</span>
            </div>
          </div>
        </div>

        {/* Sponsor Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl text-white mb-6 shadow-lg shadow-amber-500/30 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform">
          <div>
            <h4 className="font-bold flex items-center gap-1"><Star size={16} /> Shopee Super League</h4>
            <p className="text-xs text-orange-100">เข้าร่วมลุ้นรับรางวัลพิเศษ!</p>
          </div>
          <span className="bg-white text-amber-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white">เข้าร่วมเลย</span>
        </div>

        {/* Leaderboard List */}
        <div className={STYLES.card}>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-500 w-12 text-center">อันดับ</span>
            <span className="text-xs font-bold text-slate-500 flex-1 px-2">ชื่อทีม / ผู้จัดการ</span>
            <span className="text-xs font-bold text-slate-500 text-right">คะแนน</span>
          </div>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {loading ? (
              <div className="text-center py-8 text-slate-400 font-medium animate-pulse">กำลังโหลดข้อมูลกระดานผู้นำ...</div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium">ยังไม่มีผู้เข้าร่วมจัดอันดับ</div>
            ) : (
              leaders.map((player) => {
                const isCurrentUser = user && user.uid === player.id;
                const rankColorClass = getRankColor(player.rank);
                
                return (
                  <div key={player.id} 
                    className={`flex items-center p-3 rounded-xl border transition-all ${
                      isCurrentUser 
                        ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50 scale-[1.02] z-10 relative' 
                        : rankColorClass
                    }`}
                  >
                    <div className="w-12 flex justify-center items-center">
                      {player.rank <= 3 ? (
                        <Medal size={24} className={
                          player.rank === 1 ? 'text-amber-500' : 
                          player.rank === 2 ? 'text-slate-400' : 'text-orange-700'
                        } />
                      ) : (
                        <span className={`font-black text-lg ${isCurrentUser ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {player.rank || '-'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 px-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        {player.photoURL && (
                          <img src={player.photoURL} alt="" className="w-6 h-6 rounded-full object-cover border border-white shadow-sm" />
                        )}
                        <span className={`font-bold text-sm truncate ${isCurrentUser ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {player.teamName || player.displayName || 'ผู้จัดการทีมปริศนา'}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">คุณ</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-black text-lg ${isCurrentUser ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {player.userPoints || 0}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">Pts</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}