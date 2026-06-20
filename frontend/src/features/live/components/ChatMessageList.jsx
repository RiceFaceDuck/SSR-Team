import React, { useRef, useEffect, useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import NormalMessageItem from './chat/NormalMessageItem';

export default function ChatMessageList({ messages }) {
  const { userData } = useUserStore();
  const messagesEndRef = useRef(null);
  const [now, setNow] = useState(Date.now());

  // Update timer for super chat duration checking
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ฟังก์ชันแปลงเวลาที่รองรับทั้ง Timestamp (Firestore) และ Date (Local Cache)
  const getTimeMs = (timeObj) => {
    if (!timeObj) return 0;
    if (typeof timeObj.toMillis === 'function') return timeObj.toMillis();
    if (typeof timeObj.getTime === 'function') return timeObj.getTime();
    return 0;
  };

  // ค้นหา Super Chat ทั้งหมดที่ยังไม่หมดเวลา (ยังไม่จบ)
  const allSuperChats = messages.filter(
    msg => msg.isSuperChat && msg.pinnedUntil && getTimeMs(msg.pinnedUntil) > now
  ).sort((a, b) => getTimeMs(a.startTime) - getTimeMs(b.startTime));

  // แยกตัวที่กำลังแสดงผล (startTime <= now) และตัวที่กำลังรอคิว (startTime > now)
  const activeSuperChats = allSuperChats.filter(msg => !msg.startTime || getTimeMs(msg.startTime) <= now);
  const waitingSuperChats = allSuperChats.filter(msg => msg.startTime && getTimeMs(msg.startTime) > now);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-3 relative">
      
      {/* Pinned Super Chats */}
      {(activeSuperChats.length > 0 || waitingSuperChats.length > 0) && (
        <div className="sticky top-0 z-20 flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
          
          {/* Active Super Chats */}
          {activeSuperChats.map((msg) => {
            const timeLeft = Math.max(0, Math.floor((getTimeMs(msg.pinnedUntil) - now) / 1000));
            return (
              <div key={`pinned-${msg.id}`} className="shrink-0 w-[240px] bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 border-2 border-yellow-400 p-2 rounded-xl shadow-lg animate-pulse-slow">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <img src={msg.userPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.userId} alt="avatar" className="w-5 h-5 rounded-full border border-white" />
                    <span className="text-[10px] font-black text-amber-900 uppercase truncate max-w-[120px]">{msg.userName}</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-700 bg-white/50 px-1.5 py-0.5 rounded-full">{timeLeft}s</span>
                </div>
                <div className="text-sm font-bold text-amber-950 px-1 truncate">{msg.text}</div>
              </div>
            );
          })}

          {/* Waiting Super Chats (Queue) */}
          {waitingSuperChats.length > 0 && (
            <div className="shrink-0 flex items-center pr-2 border-l border-slate-200 ml-1 pl-2 gap-2">
              <div className="bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg shadow-sm text-[10px] font-bold text-slate-500 shrink-0">
                รอคิว: {waitingSuperChats.length}
              </div>
              {waitingSuperChats.map((msg, idx) => {
                const duration = Math.floor((getTimeMs(msg.pinnedUntil) - getTimeMs(msg.startTime)) / 1000);
                return (
                  <div key={`waiting-${msg.id}`} className="shrink-0 w-[180px] bg-slate-50 border-2 border-slate-200/60 p-2 rounded-xl shadow-sm opacity-90 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <img src={msg.userPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.userId} alt="avatar" className="w-5 h-5 rounded-full grayscale opacity-70" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[80px]">{msg.userName}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{duration}s</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <div className="text-xs font-bold text-slate-400 italic">⏳ รอคิวที่ {idx + 1}...</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Normal Messages Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
          ยังไม่มีข้อความ... เริ่มพูดคุยกันเลย!
        </div>
      ) : (
        messages.filter(msg => !msg.isSuperChat || !msg.startTime || getTimeMs(msg.startTime) <= now).map((msg) => {
          const isMe = userData?.uid === msg.userId;
          const isSystem = msg.isSystem;

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center text-xs font-medium text-amber-600 bg-amber-50 py-1 px-3 rounded-full mx-auto my-1">
                {msg.text}
              </div>
            );
          }

          return <NormalMessageItem key={msg.id} msg={msg} isMe={isMe} />;
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
