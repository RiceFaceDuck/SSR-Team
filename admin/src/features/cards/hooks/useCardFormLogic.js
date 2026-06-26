import { useState, useEffect, useCallback } from 'react';

export const useCardFormLogic = (initialData, onSave) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⚡',
    rarity: 'COMMON',
    effectLogic: { type: 'NONE', value: '' },
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        rarity: initialData.rarity || 'COMMON',
        price: initialData.price || 0,
        effectLogic: initialData.effectLogic || { type: 'NONE', value: '' },
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogicChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      effectLogic: { ...prev.effectLogic, [field]: value },
    }));
  };

  const calculateSmartPrice = useCallback(() => {
    const { rarity, effectLogic } = formData;
    let basePrice = 0;

    // Rarity Base Price
    switch (rarity) {
      case 'COMMON':
        basePrice = 15;
        break;
      case 'RARE':
        basePrice = 40;
        break;
      case 'EPIC':
        basePrice = 80;
        break;
      case 'LEGENDARY':
        basePrice = 180;
        break;
      default:
        basePrice = 10;
    }

    // Effect Logic Modifier
    const type = effectLogic.type;
    let effectPrice = 0;
    if (type === 'TRIPLE_CAPTAIN') effectPrice = 50;
    else if (type === 'BENCH_BOOST') effectPrice = 30;
    else if (type === 'IMMUNE_YELLOW') effectPrice = 20;
    else if (type === 'PRICE_REDUCTION') effectPrice = 40;
    else if (type === 'NOT_SUBBED_BONUS') effectPrice = 30;
    else if (type === 'POINTS_MULTIPLIER') {
      const val = parseFloat(effectLogic.value) || 1;
      effectPrice = val > 2 ? 100 : 50;
    }

    const recommendedPrice = basePrice + effectPrice;

    setFormData((prev) => ({ ...prev, price: recommendedPrice }));

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]);
    }

    return recommendedPrice;
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, price: Number(formData.price) || 0 };
    if (payload.effectLogic.type === 'CUSTOM') {
      payload.effectLogic.type = payload.effectLogic.customType || 'NONE';
      delete payload.effectLogic.customType;
    }
    onSave(payload);
  };

  return {
    formData,
    handleChange,
    handleLogicChange,
    calculateSmartPrice,
    handleSubmit,
  };
};
