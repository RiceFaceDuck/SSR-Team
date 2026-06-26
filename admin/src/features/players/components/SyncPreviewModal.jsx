import React from 'react';
import { X, Save, ArrowRight, Activity, TrendingUp, TrendingDown } from 'lucide-react';

const StatChange = ({ label, oldVal, newVal }) => {
  if (oldVal === newVal) return null;
  const isUp = newVal > oldVal;

  return (
    <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 line-through">{oldVal}</span>
        <ArrowRight className="w-3 h-3 text-gray-300" />
        <span
          className={`font-bold flex items-center gap-1 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {newVal}
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        </span>
      </div>
    </div>
  );
};

const SyncPreviewModal = ({
  isBulk,
  updatesList,
  player,
  updates,
  apiData,
  onConfirm,
  onCancel,
  isSyncing,
}) => {
  if (!isBulk && (!player || !apiData)) return null;
  if (isBulk && (!updatesList || updatesList.length === 0)) return null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto relative border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header Pattern */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-600 to-blue-700 opacity-10"></div>

      <button
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-white/80 p-1.5 rounded-full z-10 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isBulk ? 'อัปเดตข้อมูลทั้งหมด' : 'ตรวจพบการอัปเดตใหม่'}
            </h2>
            <p className="text-sm text-gray-500">ตรวจสอบความเปลี่ยนแปลงก่อนบันทึก</p>
          </div>
        </div>

        {isBulk ? (
          <>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 flex flex-col items-center justify-center shadow-inner">
              <span className="text-4xl font-black text-indigo-600 mb-1">{updatesList.length}</span>
              <p className="text-sm font-semibold text-indigo-800">รายการที่พร้อมสำหรับการอัปเดต</p>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 mb-6 pr-2">
              {updatesList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-100 shadow-sm rounded-xl"
                >
                  <img
                    src={
                      item.player.imageUrl ||
                      item.apiData.imageUrl ||
                      'https://via.placeholder.com/150'
                    }
                    alt={item.player.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.player.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.apiData.team} • {item.apiData.position}
                    </p>
                  </div>
                  {item.player.isNew ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm border border-emerald-200">
                      ✨ เพิ่มใหม่
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg whitespace-nowrap shadow-sm border border-blue-200">
                      🔄 อัปเดต
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Player Info Card */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
              <img
                src={player.imageUrl || apiData.imageUrl}
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm bg-white"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{player.fullName}</h3>
                <p className="text-sm text-gray-500">
                  {player.team} • {player.position}
                </p>
              </div>
            </div>

            {/* Changes List */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                สรุปข้อมูลที่เปลี่ยนแปลง
              </h4>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                {Object.keys(updates).length > 0 ? (
                  <div className="space-y-1">
                    {updates.goals !== undefined && (
                      <StatChange
                        label="ประตู (Goals)"
                        oldVal={player.stats?.goals || 0}
                        newVal={updates.goals}
                      />
                    )}
                    {updates.assists !== undefined && (
                      <StatChange
                        label="แอสซิสต์ (Assists)"
                        oldVal={player.stats?.assists || 0}
                        newVal={updates.assists}
                      />
                    )}
                    {updates.cleanSheets !== undefined && (
                      <StatChange
                        label="คลีนชีต (Clean Sheets)"
                        oldVal={player.stats?.cleanSheets || 0}
                        newVal={updates.cleanSheets}
                      />
                    )}
                    {updates.team !== undefined && (
                      <div className="flex items-center justify-between text-sm py-2">
                        <span className="text-gray-500 font-medium">สโมสร (Team)</span>
                        <div className="flex items-center gap-2 font-bold text-indigo-600">
                          <span className="text-gray-400 line-through font-normal">
                            {player.team}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          {updates.team}
                        </div>
                      </div>
                    )}
                    {updates.status !== undefined && (
                      <div className="flex items-center justify-between text-sm py-2">
                        <span className="text-gray-500 font-medium">สถานะ</span>
                        <div className="flex items-center gap-2 font-bold text-rose-500">
                          <span className="text-gray-400 line-through font-normal">
                            {player.status}
                          </span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          {updates.status}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    ไม่พบการเปลี่ยนแปลงข้อมูล (ข้อมูลตรงกับ API แล้ว)
                  </p>
                )}

                {/* แจ้งเตือนเรื่อง SKU */}
                {player && apiData && player.sku && apiData.sku && player.sku !== apiData.sku && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 font-semibold mb-1">
                      ⚠️ คำเตือน: รหัสอ้างอิง (SKU) จะถูกเปลี่ยนแปลง
                    </p>
                    <p className="text-[10px] text-amber-700">
                      ระบบจะเปลี่ยน SKU จาก{' '}
                      <span className="font-mono bg-amber-100 px-1 rounded">{player.sku}</span> เป็น{' '}
                      <span className="font-mono bg-amber-100 px-1 rounded">{apiData.sku}</span>{' '}
                      เพื่อให้ตรงกับ API
                      <br />
                      ** ข้อมูลเดิมจะถูกลบและแทนที่ด้วยข้อมูลนี้ **
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSyncing}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => (isBulk ? onConfirm(updatesList) : onConfirm(apiData))}
            disabled={isSyncing || (!isBulk && Object.keys(updates).length === 0)}
            className="flex-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {isSyncing ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isBulk
              ? `ยืนยันทั้งหมด (${updatesList.length})`
              : Object.keys(updates).length > 0
                ? 'ยืนยันอัปเดต'
                : 'ไม่มีอัปเดต'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncPreviewModal;
