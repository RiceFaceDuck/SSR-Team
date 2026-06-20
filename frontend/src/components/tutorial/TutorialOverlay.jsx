import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

export default function TutorialOverlay({ steps, screenName }) {
  const { tutorialActive, currentTutorialScreen, tutorialStep, nextTutorialStep, prevTutorialStep, skipTutorial } = useUserStore();
  
  const [targetRect, setTargetRect] = useState(null);

  const currentStepData = steps?.[tutorialStep];

  // Effect to calculate target element's position
  useEffect(() => {
    if (!currentStepData || !currentStepData.targetId) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(currentStepData.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        // Scroll into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStepData, tutorialStep]);

  // If this screen's tutorial is not active, return null
  if (!tutorialActive || currentTutorialScreen !== screenName || !steps || steps.length === 0) {
    return null;
  }

  const isLastStep = tutorialStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed Background */}
      <div 
        className="absolute inset-0 bg-black/70 pointer-events-auto transition-opacity duration-300"
        onClick={skipTutorial}
      />

      {/* Spotlight Effect (Cutout) */}
      {targetRect && (
        <div 
          className="absolute bg-transparent ring-[10000px] ring-black/70 rounded-xl transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 10000px rgba(0,0,0,0.7), inset 0 0 15px rgba(59, 130, 246, 0.8)',
            border: '2px solid #3b82f6'
          }}
        />
      )}

      {/* Tooltip Dialog */}
      <div 
        className="absolute z-[10000] bg-[#0b1329] border border-[#1e3a8a] shadow-2xl rounded-2xl p-5 w-[90%] max-w-[350px] pointer-events-auto transition-all duration-500 transform"
        style={{
          top: targetRect ? targetRect.top + targetRect.height + 24 : '50%',
          left: '50%',
          transform: targetRect ? 'translateX(-50%)' : 'translate(-50%, -50%)',
        }}
      >
        <button 
          onClick={skipTutorial}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors bg-[#111e3f] p-1 rounded-full"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold text-[#3b82f6] pr-6 mb-2">
          {currentStepData.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {currentStepData.content}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === tutorialStep ? 'w-5 bg-[#3b82f6]' : 'w-1.5 bg-gray-600'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {tutorialStep > 0 && (
              <button 
                onClick={prevTutorialStep}
                className="p-2 bg-[#111e3f] rounded-lg text-white hover:bg-[#1e3a8a] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <button 
              onClick={isLastStep ? skipTutorial : nextTutorialStep}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] rounded-lg text-white font-bold shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {isLastStep ? (
                <>เสร็จสิ้น <Check size={18} /></>
              ) : (
                <>ถัดไป <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
