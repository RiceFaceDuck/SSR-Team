import React from 'react';
import DataTable from '../../components/common/DataTable';

export default function RedeemLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-1">
          ตรวจสอบการแลกรางวัล (Audit Logs)
        </h2>
        <p className="text-sm text-slate-500">
          ยืนยันสิทธิ์ ตรวจสอบประวัติการแลก Pts ของผู้เล่น
          เพื่อป้องกันการโกงและเตรียมจัดส่งของรางวัล
        </p>
      </div>

      <DataTable />
    </div>
  );
}
