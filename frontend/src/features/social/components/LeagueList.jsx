import React, { useState, useEffect } from 'react';
import { Trophy, Key } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { leagueService } from '../../../services/firebase/leagueService';
import { STYLES } from '../../../config/theme';
import LeagueDetailsModal from './LeagueDetailsModal';

export default function LeagueList({ refreshTrigger, onLeaguesLoaded }) {
  const { userData } = useUserStore();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState(null);

  // ฟังค์ชันสำหรับดึงข้อมูลใหม่เวลาแก้ไข/ลบลีก
  const fetchLeagues = async () => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await leagueService.getUserLeagues(userData);
    setLeagues(data);
    if (onLeaguesLoaded) onLeaguesLoaded(data.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeagues();
  }, [userData, refreshTrigger]);

  if (loading) {
    return (
      <div className="mt-4 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-2xl mb-2"></div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return null; // ถ้าไม่มีลีกให้ซ่อนไปเลย จะได้ไม่รก
  }

  return (
    <>
      <div className="mt-2 space-y-3">
          {leagues.map((league) => (
            <div 
              key={league.id} 
              className={`${STYLES.card} !p-4 hover:border-indigo-300 transition-all cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md`}
              onClick={() => setSelectedLeague(league)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{league.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Key size={10} /> {league.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      สมาชิก {league.members?.length || 0} คน
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">อันดับของคุณ</span>
                  <span className="font-black text-xl text-indigo-600">-</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* เรียกใช้งาน Modal */}
      {selectedLeague && (
        <LeagueDetailsModal 
          league={selectedLeague} 
          onClose={() => setSelectedLeague(null)}
          onLeagueUpdated={() => {
            setSelectedLeague(null);
            fetchLeagues();
          }}
        />
      )}
    </>
  );
}
