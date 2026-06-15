import { useState, useEffect } from 'react';
import { useRewardStore } from '../../../store/rewardStore';

export const useRewardFormLogic = (isOpen, onClose, rewardToEdit) => {
  const { addReward, updateReward } = useRewardStore();

  const defaultForm = {
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    stock: 0,
    type: 'normal',
    isActive: true,
    isFlashSale: false,
    flashSaleEndTime: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (rewardToEdit) {
        let formattedTime = '';
        if (rewardToEdit.flashSaleEndTime) {
          const date = new Date(rewardToEdit.flashSaleEndTime);
          if (!isNaN(date)) {
            formattedTime = date.toISOString().slice(0, 16);
          }
        }
        
        setFormData({
          ...rewardToEdit,
          flashSaleEndTime: formattedTime
        });
      } else {
        setFormData(defaultForm);
      }
      setErrorMsg(null);
    }
  }, [isOpen, rewardToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) return setErrorMsg('กรุณากรอกชื่อของรางวัล');
    if (formData.price < 0) return setErrorMsg('ราคาห้ามติดลบ');
    if (formData.stock < 0) return setErrorMsg('สต็อกห้ามติดลบ');
    if (formData.isFlashSale && !formData.flashSaleEndTime) {
      return setErrorMsg('กรุณาระบุเวลาสิ้นสุด Flash Sale');
    }

    setIsSubmitting(true);
    try {
      if (rewardToEdit) {
        await updateReward(rewardToEdit.id, formData);
      } else {
        await addReward(formData);
      }
      onClose();
    } catch (error) {
      setErrorMsg(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    errorMsg,
    handleChange,
    handleSubmit
  };
};
