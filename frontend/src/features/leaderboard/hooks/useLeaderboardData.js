import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { leaderboardFetchService } from '../services/leaderboardFetchService';

export const useLeaderboardData = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly', 'season', 'club'
  const [isExporting, setIsExporting] = useState(false);
  const [fallbackLeaders, setFallbackLeaders] = useState([]);

  // ดึงข้อมูล Leaderboard Cache เพียงครั้งเดียว (1 Read)
  const { data: cacheData, isLoading: loading } = useQuery({
    queryKey: ['leaderboardCache'],
    queryFn: leaderboardFetchService.getLeaderboardCache,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // เลือก Array ที่จะแสดงตาม Tab
  let leaders = [];
  if (cacheData && (cacheData.weekly?.length > 0 || cacheData.season?.length > 0)) {
    if (activeTab === 'weekly') leaders = cacheData.weekly || [];
    else if (activeTab === 'season') leaders = cacheData.season || [];
    else if (activeTab === 'club') leaders = cacheData.club || [];
  } else {
    // FALLBACK: หากดึง Cache ไม่ได้หรือ Cache ว่างเปล่า ให้ดึงตรงจาก users (เพื่อให้แสดงผลได้ทันทีแม้ระบบจะยังไม่ประมวลผล)
    leaders = fallbackLeaders;
  }

  // Effect สำหรับดึงข้อมูล Fallback แบบสดๆ หาก Cache มีปัญหา
  useEffect(() => {
    if (!loading && (!cacheData || cacheData.weekly?.length === 0)) {
      const fetchFallback = async () => {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, limit(100)); // ดึงมาแค่ 100 คนป้องกัน read เยอะเกินไป
          const snap = await getDocs(q);

          const usersArray = [];
          snap.forEach((doc) => {
            const data = doc.data();
            usersArray.push({
              id: doc.id,
              displayName: data.displayName || '',
              teamName: data.teamName || '',
              photoURL: data.photoURL || '',
              userPoints: data.userPoints || 0,
              lastGameweekPoints: data.lastGameweekPoints || 0,
              clubSpentExp: data.clubSpentExp || 0,
            });
          });

          // Sort ตาม Tab ปัจจุบัน
          if (activeTab === 'weekly') {
            usersArray.sort((a, b) => b.lastGameweekPoints - a.lastGameweekPoints);
          } else if (activeTab === 'season') {
            usersArray.sort((a, b) => b.userPoints - a.userPoints);
          } else if (activeTab === 'club') {
            usersArray.sort((a, b) => b.clubSpentExp - a.clubSpentExp);
          }

          // ใส่ Rank
          const rankedUsers = usersArray.map((u, i) => ({ ...u, displayRank: i + 1 }));
          setFallbackLeaders(rankedUsers);
        } catch (err) {
          console.error('Fallback fetch error:', err);
        }
      };
      fetchFallback();
    }
  }, [loading, cacheData, activeTab]);

  const exportCompetitorData = async () => {
    setIsExporting(true);
    try {
      if (
        !cacheData ||
        !cacheData.exportDataTxt ||
        cacheData.exportDataTxt === 'ยังไม่มีข้อมูลการแข่งขัน'
      ) {
        throw new Error('ยังไม่มีข้อมูล Export หรือระบบยังไม่ได้คำนวณจากหลังบ้าน');
      }

      const txtContent = cacheData.exportDataTxt;
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `competitors_squad_data_${new Date().toISOString().split('T')[0]}.txt`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.dispatchEvent(
        new CustomEvent('SHOW_TOAST', {
          detail: { message: 'ดาวน์โหลดข้อมูลสำเร็จ!', type: 'success' },
        })
      );
    } catch (error) {
      console.error('Error exporting data:', error);
      window.dispatchEvent(
        new CustomEvent('SHOW_TOAST', {
          detail: { message: error.message || 'เกิดข้อผิดพลาดในการดาวน์โหลดข้อมูล', type: 'error' },
        })
      );
    } finally {
      setIsExporting(false);
    }
  };

  return { activeTab, setActiveTab, leaders, loading, exportCompetitorData, isExporting };
};
