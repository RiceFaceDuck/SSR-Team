/**
 * @file squadModifiers.js
 * @deprecated ⚠️ ระบบนี้ถูกยกเลิกแล้ว (Deprecated) ⚠️
 * กรุณาไปใช้ `modifiers/ModifierPipeline.js` แทน เพื่อรองรับระบบแบบ Centralized และหลีกเลี่ยงงานทับซ้อน (SRP)
 */

exports.applyCaptainMultiplier = () => { throw new Error('Deprecated: Use ModifierPipeline'); };
exports.calculateSynergyBonus = () => { throw new Error('Deprecated: Use ModifierPipeline'); };
exports.calculateManagerBonus = () => { throw new Error('Deprecated: Use ModifierPipeline'); };
exports.calculateUnderdogBoost = () => { throw new Error('Deprecated: Use ModifierPipeline'); };
exports.applyMVPBonus = () => { throw new Error('Deprecated: Use ModifierPipeline'); };
