import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'ssr-team';

// Helper hook สำหรับบันทึกค่าลง LocalStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default function useBallsCalculator() {
  // 1. Data from Firebase
  const [availableCards, setAvailableCards] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Target Variables
  const [targetBalls, setTargetBalls] = useLocalStorage('economyCalc_targetBalls', 50000); // เป้าหมาย: รางวัลอันดับ 1

  // 3. Income Variables (ต่อสัปดาห์ หรือ ต่อวัน)
  const [ballsPerAd, setBallsPerAd] = useLocalStorage('economyCalc_ballsPerAd', 10);
  const [adsPerDay, setAdsPerDay] = useLocalStorage('economyCalc_adsPerDay', 20);
  const [ballsPerQuest, setBallsPerQuest] = useLocalStorage('economyCalc_ballsPerQuest', 50);
  const [questsPerDay, setQuestsPerDay] = useLocalStorage('economyCalc_questsPerDay', 5);
  const [dailyLoginBalls, setDailyLoginBalls] = useLocalStorage('economyCalc_dailyLoginBalls', 20);
  const [weeklyBonusBalls, setWeeklyBonusBalls] = useLocalStorage(
    'economyCalc_weeklyBonusBalls',
    100
  );

  // 4. Expense Variables
  const [selectedCardId, setSelectedCardId] = useLocalStorage('economyCalc_selectedCardId', '');
  const [selectedManagerId, setSelectedManagerId] = useLocalStorage(
    'economyCalc_selectedManagerId',
    ''
  );
  const [cardsBoughtPerWeek, setCardsBoughtPerWeek] = useLocalStorage(
    'economyCalc_cardsBoughtPerWeek',
    1
  );
  const [managersBoughtPerWeek, setManagersBoughtPerWeek] = useLocalStorage(
    'economyCalc_managersBoughtPerWeek',
    1
  );
  const [chatCostPerWeek, setChatCostPerWeek] = useLocalStorage('economyCalc_chatCostPerWeek', 50);

  // Fetch Database Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cardsSnap = await getDocs(
          collection(db, 'artifacts', appId, 'public', 'data', 'cards')
        );
        const managersSnap = await getDocs(
          collection(db, 'artifacts', appId, 'public', 'data', 'managers')
        );

        const cards = cardsSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((c) => c.isActive !== false);
        const managers = managersSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((m) => m.isActive !== false);

        setAvailableCards(cards);
        setAvailableManagers(managers);
      } catch (error) {
        console.error('Error fetching items for economy calculator:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Helpers for Items ---
  const getSelectedCard = () => availableCards.find((c) => c.id === selectedCardId);
  const getSelectedManager = () => availableManagers.find((m) => m.id === selectedManagerId);

  const getCardPrice = () => {
    if (selectedCardId) {
      return getSelectedCard()?.price || 0;
    }
    // Average price if none selected
    if (availableCards.length === 0) return 50;
    const total = availableCards.reduce((sum, c) => sum + (c.price || 0), 0);
    return Math.round(total / availableCards.length);
  };

  const getManagerPrice = () => {
    if (selectedManagerId) {
      return getSelectedManager()?.price || 0;
    }
    // Average price if none selected
    if (availableManagers.length === 0) return 500;
    const total = availableManagers.reduce((sum, m) => sum + (m.price || 0), 0);
    return Math.round(total / availableManagers.length);
  };

  // --- Calculations ---

  // 1. รายรับ (Income)
  const incomePerDay = useMemo(() => {
    return ballsPerAd * adsPerDay + ballsPerQuest * questsPerDay + dailyLoginBalls;
  }, [ballsPerAd, adsPerDay, ballsPerQuest, questsPerDay, dailyLoginBalls]);

  const incomePerWeek = useMemo(() => {
    return incomePerDay * 7 + weeklyBonusBalls;
  }, [incomePerDay, weeklyBonusBalls]);

  const incomePerMonth = useMemo(() => {
    return incomePerDay * 30 + weeklyBonusBalls * 4; // ค่าประมาณ
  }, [incomePerDay, weeklyBonusBalls]);

  // 2. รายจ่าย (Expense) คิดเป็น 'ต่อสัปดาห์' ก่อน แล้วหารเป็น 'ต่อวัน'
  const expenseCardPerWeek = useMemo(
    () => getCardPrice() * cardsBoughtPerWeek,
    [getCardPrice, cardsBoughtPerWeek, selectedCardId, availableCards]
  );
  const expenseManagerPerWeek = useMemo(
    () => getManagerPrice() * managersBoughtPerWeek,
    [getManagerPrice, managersBoughtPerWeek, selectedManagerId, availableManagers]
  );

  const expensePerWeek = useMemo(() => {
    return expenseCardPerWeek + expenseManagerPerWeek + chatCostPerWeek;
  }, [expenseCardPerWeek, expenseManagerPerWeek, chatCostPerWeek]);

  const expensePerDay = Math.ceil(expensePerWeek / 7); // ปัดเศษขึ้นให้รายจ่ายดูสมจริง

  // 3. กำไรสุทธิ (Net Income)
  const netIncomePerWeek = useMemo(() => {
    return incomePerWeek - expensePerWeek;
  }, [incomePerWeek, expensePerWeek]);

  const netIncomePerDay = useMemo(() => {
    return incomePerDay - expensePerDay;
  }, [incomePerDay, expensePerDay]);

  // 4. เวลาที่ใช้ถึงเป้าหมาย (Raw Calculation)
  const rawDaysRequired = useMemo(() => {
    if (incomePerDay <= 0) return Infinity;
    return Math.ceil(targetBalls / incomePerDay);
  }, [targetBalls, incomePerDay]);

  // 5. เวลาที่ใช้ถึงเป้าหมาย (Net Calculation)
  const netDaysRequired = useMemo(() => {
    if (netIncomePerDay <= 0) return Infinity; // ล้มละลาย หาไม่ทันใช้
    return Math.ceil(targetBalls / netIncomePerDay);
  }, [targetBalls, netIncomePerDay]);

  return {
    // States
    isLoading,
    availableCards,
    availableManagers,

    targetBalls,
    setTargetBalls,

    ballsPerAd,
    setBallsPerAd,
    adsPerDay,
    setAdsPerDay,
    ballsPerQuest,
    setBallsPerQuest,
    questsPerDay,
    setQuestsPerDay,
    dailyLoginBalls,
    setDailyLoginBalls,
    weeklyBonusBalls,
    setWeeklyBonusBalls,

    selectedCardId,
    setSelectedCardId,
    selectedManagerId,
    setSelectedManagerId,
    cardsBoughtPerWeek,
    setCardsBoughtPerWeek,
    managersBoughtPerWeek,
    setManagersBoughtPerWeek,
    chatCostPerWeek,
    setChatCostPerWeek,

    // Calculated Results
    getCardPrice,
    getManagerPrice,
    getSelectedCard,
    getSelectedManager,

    incomePerDay,
    incomePerWeek,
    incomePerMonth,

    expenseCardPerWeek,
    expenseManagerPerWeek,
    expensePerWeek,
    expensePerDay,

    netIncomePerDay,
    netIncomePerWeek,

    rawDaysRequired,
    netDaysRequired,
  };
}
