import React, { useEffect, useState } from 'react';
import { historyDatabase } from '../../../services/firebase/historyDatabase';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function DataFetchMonitor() {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const logs = await historyDatabase.getRecentFetchHistory();
    setHistoryLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    // Handle both Firestore Timestamp and JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Clock className="text-slate-400" />
          ประวัติการดึงข้อมูลล่าสุด
        </h3>
        <button
          onClick={fetchLogs}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>กำลังโหลดประวัติ...</p>
        </div>
      ) : historyLogs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <p className="text-slate-500 font-medium">ยังไม่มีประวัติการดึงข้อมูล</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">ประเภทข้อมูล</th>
                <th className="px-6 py-4">ฤดูกาล</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">จำนวน (Records)</th>
                <th className="px-6 py-4">เวลาดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {log.type === 'PLAYERS' ? 'สถิตินักเตะ' : log.type}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.season}</td>
                  <td className="px-6 py-4">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs">
                        <CheckCircle2 size={14} /> สำเร็จ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 font-semibold text-xs">
                        <XCircle size={14} /> ล้มเหลว
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {log.recordsFetched?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
