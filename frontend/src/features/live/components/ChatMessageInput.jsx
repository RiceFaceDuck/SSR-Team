import React, { useState, useEffect } from 'react';
import { Send, Zap } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { chatService } from '../../../services/firebase/chatService';
import { showToast } from '../../../utils/toast';

export default function ChatMessageInput({ chatConfig, messages = [] }) {
  const { userData, balls, useBalls, clubData } = useUserStore();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Local state for last free chat
  const [localLastFreeChat, setLocalLastFreeChat] = useState(() => {
    return localStorage.getItem(`lastFreeChat_${userData?.uid}`) || 0;
  });

  const normalCost = chatConfig?.normalChatCost ?? 2;
  const baseSuperCost = chatConfig?.superChatCost ?? 15;
  const superDuration = chatConfig?.superChatDuration ?? 30;
  const superIncrement = chatConfig?.superChatCostIncrement ?? 5;
  const superResetTime = chatConfig?.superChatResetTime ?? 60;
  const freeInterval = chatConfig?.normalChatFreeInterval ?? 300;

  // Calculate dynamic super chat cost
  const now = Date.now();
  const recentSuperChats = messages.filter(msg => {
    if (!msg.isSuperChat || !msg.createdAt) return false;
    // Check if it's within the reset window
    const msgTime = msg.createdAt.toMillis ? msg.createdAt.toMillis() : msg.createdAt;
    return (now - msgTime) < (superResetTime * 1000);
  });
  const currentSuperCost = baseSuperCost + (recentSuperChats.length * superIncrement);

  // Check if normal chat is free
  const isFreeChatAvailable = (now - Number(localLastFreeChat)) >= (freeInterval * 1000);
  const actualNormalCost = isFreeChatAvailable ? 0 : normalCost;

  const handleSendMessage = async (e, isSuperChat = false) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    if (!userData || !userData.uid) {
      showToast('กรุณาเข้าสู่ระบบเพื่อพิมพ์แชท', 'error');
      return;
    }

    const currentBalls = balls || 0;
    const cost = isSuperChat ? currentSuperCost : actualNormalCost;

    const totalLevels = (clubData?.stadiumLevel || 1) + (clubData?.trainingGroundLevel || 1) + (clubData?.hospitalLevel || 1) + (clubData?.gymLevel || 1) + (clubData?.youthAcademyLevel || 1);
    const clubTier = totalLevels >= 45 ? 4 : totalLevels >= 30 ? 3 : totalLevels >= 15 ? 2 : 1;

    if (currentBalls < cost) {
      showToast(`Balls ไม่พอ (ต้องการ ${cost} Balls)`, 'error');
      return;
    }

    setIsSending(true);
    const result = await chatService.sendMessage(userData, inputText, {
      isSuperChat,
      cost,
      duration: superDuration,
      freeInterval: freeInterval,
      clubTier,
      equippedTitle: userData.equippedTitle || null
    });

    if (result.success) {
      setInputText('');
      
      // หัก Balls ฝั่งหน้าบ้านทันที เพื่อความรวดเร็ว
      if (result.actualCost > 0) {
        useBalls(result.actualCost);
      }
      
      // ถ้าเป็นการใช้สิทธิ์ Free Chat ให้บันทึกเวลาใหม่ลง LocalStorage ชั่วคราวเพื่อให้ปุ่มอัปเดต
      if (!isSuperChat && result.actualCost === 0) {
        const timestamp = Date.now();
        localStorage.setItem(`lastFreeChat_${userData.uid}`, timestamp);
        setLocalLastFreeChat(timestamp);
      }
      
    } else {
      if (result.error === 'insufficient_balls') {
        showToast(`ยอด Balls ไม่พอสำหรับส่งแชท`, 'error');
      } else {
        showToast(`ส่งข้อความไม่สำเร็จ: ${result.error}`, 'error');
      }
    }
    setIsSending(false);
  };

  return (
    <div className="mt-auto pt-3 border-t border-slate-100">
      <form onSubmit={(e) => handleSendMessage(e, false)} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
          disabled={!userData || isSending}
        />
        <button 
          type="button" 
          onClick={(e) => handleSendMessage(e, true)}
          disabled={!userData || isSending || !inputText.trim() || (balls < currentSuperCost)}
          title={`Super Chat`}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:from-slate-300 disabled:to-slate-300 text-amber-950 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-sm gap-1"
        >
          <Zap size={14} /> Super chat ↲ use {currentSuperCost} Balls
        </button>
        <button 
          type="submit" 
          disabled={!userData || isSending || !inputText.trim() || (balls < actualNormalCost)}
          title={`ส่งปกติ`}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-sm gap-1"
        >
          <Send size={14} /> {actualNormalCost === 0 ? 'Free' : `use ${actualNormalCost} Balls`}
        </button>
      </form>
    </div>
  );
}
