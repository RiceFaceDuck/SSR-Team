import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useUserStore } from '../../../store/useUserStore';
import { Trophy, Calendar } from 'lucide-react';

export default function GameweekHistory() {
  const { userData } = useUserStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.uid) return;

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'users', userData.uid, 'gameweek_history'),
          orderBy('gameweekId', 'desc')
        );
        const snap = await getDocs(q);
        const list = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        setHistory(list);
      } catch (err) {
        console.error('Error fetching gameweek history', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userData?.uid]);

  if (loading) {
    return <div className="animate-pulse bg-white p-4 rounded-xl h-24 mb-6"></div>;
  }

  if (history.length === 0) {
    return null; // Don't show if no history
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          ประวัติการจัดทีม (GW)
        </h3>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
        {history.map((gw) => (
          <div
            key={gw.id}
            className="min-w-[140px] bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl p-4 shadow-lg text-white snap-center relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Calendar size={40} />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-200">สัปดาห์ที่</p>
              <p className="font-black text-xl tracking-tight">{gw.gameweekId}</p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-black text-amber-400">
                {gw.points} <span className="text-xs font-medium text-indigo-200">Pts</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
