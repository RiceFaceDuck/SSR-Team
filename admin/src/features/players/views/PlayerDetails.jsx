import React from 'react';
import {
  X,
  Edit,
  User,
  Shield,
  Target,
  Activity,
  AlertTriangle,
  Hash,
  MapPin,
  Coins,
  Star,
} from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getOptimizedImageUrl } from '../utils/formatters';

/**
 * PlayerDetails View
 * หน้าจอแสดงรายละเอียดเชิงลึกของนักเตะ 1 คน (มักใช้แสดงใน Modal หรือ Drawer)
 * @param {Object} player - ข้อมูลนักเตะที่ต้องการแสดง
 * @param {Function} onClose - ฟังก์ชันสำหรับปิดหน้าต่างรายละเอียด
 * @param {Function} onEdit - ฟังก์ชันสำหรับสลับไปโหมดแก้ไขข้อมูล
 */
const PlayerDetails = ({ player, onClose, onEdit }) => {
  if (!player) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto overflow-hidden flex flex-col max-h-[90vh]">
      {/* ส่วนหัว (Header Profile) */}
      <div className="relative bg-gradient-to-r from-blue-700 to-blue-900 p-6 sm:p-8 flex justify-between items-start text-white">
        {/* ปุ่มปิด - วางไว้มุมขวาบน */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm transition-colors text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner overflow-hidden">
            {player.imageUrl ? (
              <img
                src={getOptimizedImageUrl(player.imageUrl)}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wide">{player.name}</h2>
            <p className="text-blue-100 mt-1 text-sm">{player.fullName}</p>
            <div className="mt-3">
              <StatusBadge
                status={player.status}
                className="bg-white/10 text-white border-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนเนื้อหา (Body Scrollable) */}
      <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
        {/* ข้อมูลทั่วไป (General Info) */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            ข้อมูลพื้นฐาน (General Information)
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-start">
              <Hash className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">SKU (อ้างอิง API)</p>
                <p className="text-sm font-medium text-gray-900">{player.sku || '-'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">สโมสร (Team)</p>
                <p className="text-sm font-medium text-gray-900">{player.team || 'ไม่ระบุ'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">ตำแหน่ง (Position)</p>
                <p className="text-sm font-medium text-gray-900">{player.position || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ข้อมูลในเกม Fantasy (Fantasy Info) */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
            ข้อมูลแฟนตาซี (Fantasy Data)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 flex items-center border border-green-100">
              <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-800">ราคาปัจจุบัน</p>
                <p className="text-2xl font-bold text-green-700">
                  {player.displayPrice
                    ? String(player.displayPrice).replace('£', '')
                    : `${player.price || 0}m`}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 flex items-center border border-blue-100">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-800">คะแนนรวม</p>
                <p className="text-2xl font-bold text-blue-700">{player.totalPoints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* สถิติการเล่น (Match Statistics) - แสดงถ้ามีข้อมูล */}
        {player.stats && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              สถิติการเล่น (Season Stats)
            </h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Target className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-800">{player.stats.goals || 0}</p>
                <p className="text-xs text-gray-500">ประตู</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-800">{player.stats.assists || 0}</p>
                <p className="text-xs text-gray-500">แอสซิสต์</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-800">{player.stats.cleanSheets || 0}</p>
                <p className="text-xs text-gray-500">คลีนชีต</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg flex flex-col items-center justify-center">
                <div className="flex gap-1 mb-1">
                  <div
                    className="w-3.5 h-4.5 bg-yellow-400 rounded-sm shadow-sm"
                    title="ใบเหลือง"
                  ></div>
                  <div className="w-3.5 h-4.5 bg-red-500 rounded-sm shadow-sm" title="ใบแดง"></div>
                </div>
                <p className="text-xl font-bold text-gray-800">
                  {player.stats.yellowCards || 0}/{player.stats.redCards || 0}
                </p>
                <p className="text-xs text-gray-500">การ์ด</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ส่วนท้าย (Footer Actions) */}
      <div className="p-5 border-t border-gray-200 bg-white flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
        >
          ปิดหน้าต่าง
        </button>
        {onEdit && (
          <button
            onClick={() => onEdit(player)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            แก้ไขข้อมูล
          </button>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;
