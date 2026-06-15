import { useState, useEffect, useCallback } from 'react';
import { managerDatabase } from '../../../services/firebase/managerDatabase';

export const useManagerFormLogic = (initialData, onSaved) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    avatarUrl: '',
    description: '',
    price: 0,
    isActive: true,
    effectLogic: '{\n  "type": "UNKNOWN_BONUS"\n}'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        avatarUrl: initialData.avatarUrl || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        isActive: initialData.isActive !== false,
        effectLogic: initialData.effectLogic ? JSON.stringify(initialData.effectLogic, null, 2) : '{\n  "type": "UNKNOWN_BONUS"\n}'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateSmartPrice = useCallback(() => {
    let parsedLogic = {};
    try {
      parsedLogic = JSON.parse(formData.effectLogic);
    } catch (err) {
      setError('ไม่สามารถประเมินราคาได้: รูปแบบ JSON ใน Effect Logic ไม่ถูกต้อง');
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 50, 50]);
      }
      return;
    }
    
    setError('');
    let recommendedPrice = 50; // Base Manager Price
    
    const type = parsedLogic.type;
    if (type === 'BUDGET_BONUS') {
      const val = parseFloat(parsedLogic.value) || 0;
      recommendedPrice += Math.max(0, val * 5); // 5 Balls per 1m budget
    } else if (type === 'POINTS_MULTIPLIER') {
      recommendedPrice += 150;
    } else if (type === 'SPECIAL_FORMATION') {
      recommendedPrice += 100;
    } else {
      recommendedPrice += 50; // Generic bonus
    }

    setFormData(prev => ({ ...prev, price: recommendedPrice }));
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([20, 30, 20]);
    }
  }, [formData.effectLogic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let parsedLogic = {};
    try {
      parsedLogic = JSON.parse(formData.effectLogic);
    } catch (err) {
      setError('Invalid JSON in Effect Logic');
      setIsSubmitting(false);
      return;
    }

    if (!formData.id.trim()) {
      setError('ID is required');
      setIsSubmitting(false);
      return;
    }

    try {
      await managerDatabase.saveManager(formData.id, {
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        description: formData.description,
        price: Number(formData.price) || 0,
        isActive: formData.isActive,
        effectLogic: parsedLogic
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    error,
    isEditing,
    handleChange,
    calculateSmartPrice,
    handleSubmit
  };
};
