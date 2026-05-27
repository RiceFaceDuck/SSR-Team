import React from 'react';
import { STYLES } from '../../config/theme';

export default function CountdownTimer() {
  return (
    <div className={STYLES.badge}>
      <span className="relative flex h-2 w-2 mr-1">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      ⏳ ปิดตลาดใน: 12 ชม. 45 นาที
    </div>
  );
}