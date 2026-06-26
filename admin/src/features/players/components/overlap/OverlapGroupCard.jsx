import React from 'react';
import { ShieldAlert } from 'lucide-react';
import OverlapPlayerItem from './OverlapPlayerItem';

const OverlapGroupCard = ({ group, onDeletePlayer, disabled }) => {
  return (
    <div className="border border-rose-200 rounded-xl p-5 bg-rose-50/50">
      <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5" />
        {group.title}{' '}
        <span className="text-sm font-normal text-rose-600">({group.items.length} รายการ)</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.items.map((player) => (
          <OverlapPlayerItem
            key={player.id}
            player={player}
            onDelete={onDeletePlayer}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default OverlapGroupCard;
