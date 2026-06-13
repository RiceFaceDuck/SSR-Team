import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { STYLES } from '../../../config/theme';
import { chatService } from '../../../services/firebase/chatService';
import { useGameStore } from '../../../store/useGameStore';
import ChatMessageList from './ChatMessageList';
import ChatMessageInput from './ChatMessageInput';

export default function LiveChatContainer() {
  const [messages, setMessages] = useState([]);
  const chatConfig = useGameStore(state => state.chatConfig);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToChat((newMessages) => {
      setMessages(newMessages);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white border-2 border-slate-300/70 rounded-3xl p-3 shadow-xl shadow-slate-300/60 flex-1 flex flex-col min-h-0 relative overflow-hidden">
      <h3 className="font-bold text-slate-800 mb-2 border-b-2 border-slate-200 pb-2 flex items-center gap-2 shrink-0">
        <MessageCircle size={18} className="text-indigo-500" /> ห้องแชทรวม (Global Chat)
      </h3>
      
      <ChatMessageList messages={messages} />
      <ChatMessageInput chatConfig={chatConfig} messages={messages} />
    </div>
  );
}
