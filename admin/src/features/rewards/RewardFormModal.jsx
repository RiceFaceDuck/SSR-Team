import React from 'react';
import { X, Box, Tag, Info } from 'lucide-react';
import { useRewardFormLogic } from './hooks/useRewardFormLogic';
import RewardBasicInfo from './components/RewardBasicInfo';
import RewardEconomy from './components/RewardEconomy';

const RewardFormModal = ({ isOpen, onClose, rewardToEdit = null }) => {
  const { formData, isSubmitting, errorMsg, handleChange, handleSubmit } = useRewardFormLogic(
    isOpen,
    onClose,
    rewardToEdit
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {rewardToEdit ? (
              <Tag size={20} className="text-blue-500" />
            ) : (
              <Box size={20} className="text-green-500" />
            )}
            {rewardToEdit ? 'แก้ไขของรางวัล' : 'สร้างของรางวัลใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 text-sm">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form id="reward-form" onSubmit={handleSubmit} className="space-y-6">
            <RewardBasicInfo formData={formData} handleChange={handleChange} />
            <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>
            <RewardEconomy formData={formData} handleChange={handleChange} />
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            form="reward-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : rewardToEdit ? (
              'บันทึกการแก้ไข'
            ) : (
              'สร้างของรางวัล'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardFormModal;
