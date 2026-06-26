import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { cardDatabase } from '../../../services/firebase/cardDatabase';
import CardForm from '../components/CardForm';
import CardListHeader from '../components/CardListHeader';
import CardItem from '../components/CardItem';

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
      const savedCard = await cardDatabase.saveCard(cardData);

      // ✅ ใช้วิธีอัปเดต State โดยตรง ไม่เรียก fetchCards() ใหม่ เพื่อประหยัด Firebase Reads
      setCards((prev) => {
        const index = prev.findIndex((c) => c.id === savedCard.id);
        if (index >= 0) {
          const newCards = [...prev];
          newCards[index] = savedCard;
          return newCards;
        }
        return [...prev, savedCard];
      });

      setIsFormOpen(false);
      setEditingCard(null);
    } catch (error) {
      console.error(error);
      alert('บันทึกข้อมูลล้มเหลว');
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบการ์ดใบนี้?')) {
      try {
        await cardDatabase.deleteCard(cardId);
        // ✅ ใช้วิธีลบจาก State ทันที ไม่ต้อง Fetch ใหม่
        setCards((prev) => prev.filter((c) => c.id !== cardId));
      } catch (error) {
        console.error(error);
        alert('ลบข้อมูลล้มเหลว');
      }
    }
  };

  const handleMockCards = async () => {
    if (window.confirm('คุณต้องการสร้างการ์ดจำลองใช่หรือไม่?')) {
      try {
        setIsLoading(true);
        const newSavedCards = await cardDatabase.seedMockCards();
        setCards((prev) => [...prev, ...newSavedCards]);
        alert('สร้างการ์ดจำลองสำเร็จ!');
      } catch (error) {
        console.error(error);
        alert('เกิดข้อผิดพลาดในการสร้างข้อมูลจำลอง');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header (แยก Component ตามหลัก SRP) */}
      <CardListHeader
        onAddClick={() => {
          setEditingCard(null);
          setIsFormOpen(true);
        }}
        onMockClick={handleMockCards}
      />

      {/* List Content */}
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-slate-500 animate-pulse font-bold flex items-center gap-2">
              <Zap className="animate-bounce text-purple-400" /> กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Zap className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-slate-600 mb-1">ยังไม่มีการ์ดในระบบ</h3>
            <p className="text-sm text-slate-400">
              กดปุ่ม "เพิ่มการ์ดใหม่" เพื่อสร้างการ์ดใบแรกของคุณ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onEdit={(c) => {
                  setEditingCard(c);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <CardForm
          initialData={editingCard}
          onSave={handleSaveCard}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
}
