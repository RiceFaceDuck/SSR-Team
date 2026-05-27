import React from 'react';
import { STYLES } from '../../config/theme';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`${STYLES.glassCard} ${className}`}>
      {children}
    </div>
  );
}