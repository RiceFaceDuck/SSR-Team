import React from 'react';
import SaveSquadManager from './save/SaveSquadManager';
import ManagerSelectionModal from '../ManagerSelectionModal';
import PlayerActionPopup from './PlayerActionPopup';
import PowerCardPopup from '../PowerCardPopup';
import ConfettiEffect from '../../../components/common/ConfettiEffect';

export default function PitchModals({
  isSaveModalOpen,
  setIsSaveModalOpen,
  handleConfirmSave,
  isManagerModalOpen,
  setIsManagerModalOpen,
  popupPlayer,
  setPopupPlayer,
  handlePopupAction,
  powerCardPlayer,
  setPowerCardPlayer,
  showConfetti,
  setShowConfetti,
}) {
  return (
    <>
      <SaveSquadManager
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirmSave={handleConfirmSave}
      />
      <ManagerSelectionModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
      />
      {popupPlayer && (
        <PlayerActionPopup
          player={popupPlayer}
          onClose={() => setPopupPlayer(null)}
          onAction={handlePopupAction}
        />
      )}
      <PowerCardPopup
        isOpen={!!powerCardPlayer}
        onClose={() => setPowerCardPlayer(null)}
        player={powerCardPlayer}
      />
      <ConfettiEffect
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
        type="burst"
      />
    </>
  );
}
