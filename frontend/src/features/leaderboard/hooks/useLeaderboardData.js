import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const APP_ID = 'ssr-team';

export const useLeaderboardData = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'season', 'club'
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let q;
        switch (activeTab) {
          case 'weekly':
            // Assuming lastGameweekPoints exists, fallback to userPoints if it doesn't 
            q = query(collection(db, 'users'), orderBy('lastGameweekPoints', 'desc'), limit(50));
            break;
          case 'season':
            q = query(collection(db, 'users'), orderBy('userPoints', 'desc'), limit(50));
            break;
          case 'club':
            q = query(collection(db, 'users'), orderBy('clubSpentExp', 'desc'), limit(50));
            break;
          default:
            q = query(collection(db, 'users'), orderBy('rank', 'asc'), limit(50));
        }

        const snap = await getDocs(q);
        const list = [];
        let index = 1;
        snap.forEach(doc => {
          const data = doc.data();
          if (data.hasJoinedGame) {
            // Assign a display rank based on the sorted order since we might not have pre-calculated ranks for all criteria
            list.push({ id: doc.id, displayRank: index++, ...data });
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
  }, [activeTab]);

  const exportCompetitorData = async () => {
    setIsExporting(true);
    try {
      // ดึงรายชื่อ top 50
      const usersRef = collection(db, 'users');
      const usersQ = query(usersRef, orderBy('userPoints', 'desc'), limit(50));
      const usersSnap = await getDocs(usersQ);
      
      let txtContent = "=== ข้อมูลทีมผู้เข้าแข่งขัน (Top 50) ===\n\n";

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        if (!userData.hasJoinedGame) continue;

        const squadRef = collection(db, `artifacts/${APP_ID}/users/${userDoc.id}/game_data`);
        const squadDoc = await getDocs(query(squadRef, limit(1))); // Since it's 'squad' doc inside game_data
        // Actually, the squad doc is at artifacts/ssr-team/users/{userId}/game_data/squad
        
        // Correct query for squad document
        const { doc, getDoc } = await import('firebase/firestore');
        const squadActualRef = doc(db, 'artifacts', APP_ID, 'users', userDoc.id, 'game_data', 'squad');
        const squadSnap = await getDoc(squadActualRef);
        
        let squadInfo = 'ไม่มีข้อมูลการจัดทีม';
        if (squadSnap.exists()) {
          const sData = squadSnap.data();
          const players = sData.mySquad?.map(p => ` - ${p.position}: ${p.playerId} ${p.isStarting ? '(ตัวจริง)' : '(สำรอง)'} ${p.appliedCardId ? `[การ์ด: ${p.appliedCardId}]` : ''}`) || [];
          squadInfo = `ผู้จัดการทีม: ${sData.manager?.id || 'ไม่มี'}\nแผนการเล่น: ${sData.formation || 'ไม่ระบุ'}\nกัปตัน: ${sData.captainId || 'ไม่มี'}\nนักเตะ:\n${players.join('\n')}`;
        }

        txtContent += `[ ทีม: ${userData.teamName || userData.displayName || 'ปริศนา'} ]\n`;
        txtContent += `แต้มรวม: ${userData.userPoints || 0}\n`;
        txtContent += `${squadInfo}\n`;
        txtContent += `----------------------------------------\n\n`;
      }

      // สร้างไฟล์ .txt และดาวน์โหลด
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `competitors_squad_data_${new Date().toISOString().split('T')[0]}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Error exporting data:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล");
    } finally {
      setIsExporting(false);
    }
  };

  return { activeTab, setActiveTab, leaders, loading, exportCompetitorData, isExporting };
};
