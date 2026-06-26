import React from 'react';
import SyncPreviewModal from '../components/SyncPreviewModal';
import PlayerDetails from './PlayerDetails';
import ApiSettingsModal from '../../settings/components/ApiSettingsModal';

const PlayerListModals = ({
  syncModal,
  setSyncModal,
  handleConfirmSync,
  detailModalPlayer,
  setDetailModalPlayer,
  onEditPlayer,
  isApiSettingsOpen,
  setIsApiSettingsOpen,
}) => {
  return (
    <>
      {syncModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setSyncModal({ ...syncModal, isOpen: false })}
          ></div>
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            <SyncPreviewModal
              isBulk={syncModal.isBulk}
              updatesList={syncModal.updatesList}
              player={syncModal.player}
              apiData={syncModal.apiData}
              updates={syncModal.updates}
              onConfirm={handleConfirmSync}
              onCancel={() => setSyncModal({ ...syncModal, isOpen: false })}
            />
          </div>
        </div>
      )}

      {detailModalPlayer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setDetailModalPlayer(null)}
          ></div>
          <div className="relative z-10 w-full flex justify-center animate-in fade-in zoom-in-95 duration-200">
            <PlayerDetails
              player={detailModalPlayer}
              onClose={() => setDetailModalPlayer(null)}
              onEdit={(p) => {
                setDetailModalPlayer(null);
                onEditPlayer(p);
              }}
            />
          </div>
        </div>
      )}

      <ApiSettingsModal isOpen={isApiSettingsOpen} onClose={() => setIsApiSettingsOpen(false)} />
    </>
  );
};

export default PlayerListModals;
