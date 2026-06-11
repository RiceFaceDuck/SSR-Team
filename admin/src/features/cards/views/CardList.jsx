import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Zap } from 'lucide-react';
import { cardDatabase } from '../../../services/firebase/cardDatabase';
import CardForm from '../components/CardForm';

export default function CardList() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const data = await cardDatabase.getAllCards();
      setCards(data);
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลการ์ด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCard = async (cardData) => {
    try {
      await cardDatabase.saveCard(cardData);
      setIsFormOpen(false);
      setEditingCard(null);
      fetchCards();
    } catch (error) {
      console.error(error);
      alert('บันทึกข้อมูลล้มเหลว');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบการ์ดใบนี้?')) {
      try {
        await cardDatabase.deleteCard(cardId);
        fetchCards();
      } catch (error) {
        console.error(error);
        alert('ลบข้อมูลล้มเหลว');
      }
    }
  };

  const handleMockCards = async () => {
    if (window.confirm('คุณต้องการสร้างการ์ดจำลอง 3 ใบใช่หรือไม่?')) {
      try {
        setIsLoading(true);
        const mockCards = [
          { name: 'ลดค่าตัวนักเตะ', description: 'ลดราคาค่าตัวนักเตะคนนี้ลง 0.5m ทันที', icon: '💰', effectLogic: { type: 'PRICE_REDUCTION', value: 0.5 }, isActive: true },
          { name: 'พลังตัวจริง', description: 'ได้รับ +2 คะแนนโบนัสพิเศษ หากไม่ถูกเปลี่ยนตัวออก', icon: '🏃‍♂️', effectLogic: { type: 'NOT_SUBBED_BONUS', value: 2 }, isActive: true },
          { name: 'รอดพ้นใบเหลือง', description: 'ไม่โดนหักคะแนนแม้จะได้รับใบเหลืองในเกมนี้', icon: '🛡️', effectLogic: { type: 'IMMUNE_YELLOW', value: '' }, isActive: true }
        ];
        
        for (const card of mockCards) {
          await cardDatabase.saveCard(card);
        }
        
        alert('สร้างการ์ดจำลองสำเร็จ!');
        fetchCards();
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการสร้างข้อมูลจำลอง');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-purple-500" />
            ระบบจัดการการ์ดพลัง
          </h2>
          <p className="text-slate-500 mt-1">จัดการข้อมูลการ์ดเสริมพลัง (Power Cards) ที่ผู้เล่นสามารถนำไปใช้งานได้</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleMockCards}
            className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Zap size={18} />
            จำลองข้อมูลการ์ด
          </button>
          <button 
            onClick={() => { setEditingCard(null); setIsFormOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus size={18} />
            เพิ่มการ์ดใหม่
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Zap className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-slate-600 mb-1">ยังไม่มีการ์ดในระบบ</h3>
            <p className="text-sm text-slate-400">กดปุ่ม "เพิ่มการ์ดใหม่" เพื่อสร้างการ์ดใบแรกของคุณ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(card => (
              <div key={card.id} className="border border-slate-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all group bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 text-2xl flex items-center justify-center rounded-xl shadow-sm">
                    {card.icon || '⚡'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${card.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {card.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 mb-1">{card.name}</h3>
                <p className="text-sm text-slate-500 mb-4 h-10 overflow-hidden line-clamp-2">{card.description}</p>
                
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4 text-xs font-mono text-slate-600">
                  <span className="font-bold text-slate-400 mr-2">LOGIC:</span> 
                  {card.effectLogic?.type}
                  {card.effectLogic?.value ? ` (${card.effectLogic.value})` : ''}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingCard(card); setIsFormOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold transition-colors"
                  >
                    <Edit2 size={16} /> แก้ไข
                  </button>
                  <button 
                    onClick={() => handleDeleteCard(card.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-colors"
                  >
                    <Trash2 size={16} /> ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <CardForm 
          initialData={editingCard} 
          onSave={handleSaveCard} 
          onCancel={() => { setIsFormOpen(false); setEditingCard(null); }} 
        />
      )}
    </div>
  );
}
