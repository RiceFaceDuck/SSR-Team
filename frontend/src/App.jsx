import React, { useState } from 'react';

import MobileLayout from './components/layout/MobileLayout';
import { STYLES } from './config/theme';

// Import ทุกหน้าจอ
import LoginScreen from './features/auth/LoginScreen';
import PitchScreen from './features/pitch/PitchScreen';
import MarketScreen from './features/market/MarketScreen';
import QuestScreen from './features/quests/QuestScreen';
import RedeemScreen from './features/redeem/RedeemScreen';

// หน้าจอใหม่ (ชุดที่ 5)
import ProfileScreen from './features/profile/ProfileScreen';
import LeaderboardScreen from './features/leaderboard/LeaderboardScreen';
import SocialScreen from './features/social/SocialScreen';
import LiveScoreScreen from './features/live/LiveScoreScreen';

export default function App() {
  // สถานะล็อกอินจำลอง (login หรือ frontend)
  const [appState, setAppState] = useState('login'); 
  // สถานะหน้าปัจจุบัน
  const [currentPath, setCurrentPath] = useState('pitch');

  if (appState === 'login') {
    return <LoginScreen onLogin={() => setAppState('frontend')} />;
  }

  return (
    <MobileLayout 
      currentPath={currentPath} 
      onNavigate={setCurrentPath}
      onLogout={() => setAppState('login')}
    >
      {/* ระบบ Router สลับหน้า */}
      {currentPath === 'pitch' && <PitchScreen />}
      {currentPath === 'market' && <MarketScreen />}
      {currentPath === 'quest' && <QuestScreen />}
      {currentPath === 'redeem' && <RedeemScreen />}
      
      {/* Router หน้าใหม่ */}
      {currentPath === 'profile' && <ProfileScreen />}
      {currentPath === 'leaderboard' && <LeaderboardScreen />}
      {currentPath === 'social' && <SocialScreen />}
      {currentPath === 'live' && <LiveScoreScreen />}
      
    </MobileLayout>
  );
}