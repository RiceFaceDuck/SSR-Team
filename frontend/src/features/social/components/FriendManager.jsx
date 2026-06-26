import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { Search, UserPlus, UserCheck, UserX, UserMinus } from 'lucide-react';
import { toast } from '../../../utils/toast';

export default function FriendManager() {
  const {
    userData,
    friends,
    isFriendsLoading,
    loadFriends,
    searchFriend,
    addFriend,
    acceptFriend,
    removeOrRejectFriend,
  } = useUserStore();
  const [searchUid, setSearchUid] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (userData?.uid) {
      loadFriends(userData.uid);
    }
  }, [userData?.uid, loadFriends]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUid.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    const result = await searchFriend(searchUid.trim());
    if (result) {
      if (result.id === userData.uid) {
        toast.error('ไม่สามารถค้นหาตัวเองได้');
      } else {
        setSearchResult(result);
      }
    } else {
      toast.error('ไม่พบผู้ใช้งานนี้ (ตรวจสอบ UID ให้ถูกต้อง)');
    }
    setIsSearching(false);
  };

  const handleAddFriend = async (receiverData) => {
    const res = await addFriend(userData.uid, receiverData.id, userData, receiverData);
    if (res.success) {
      toast.success(`ส่งคำขอเป็นเพื่อนไปยัง ${receiverData.displayName} แล้ว`);
      setSearchResult(null);
      setSearchUid('');
    } else {
      toast.error(res.error);
    }
  };

  const handleAccept = async (friendUid) => {
    const res = await acceptFriend(userData.uid, friendUid);
    if (res.success) {
      toast.success('ยอมรับคำขอเป็นเพื่อนแล้ว');
    } else {
      toast.error(res.error);
    }
  };

  const handleRemove = async (friendUid, isReject = false) => {
    if (!isReject && !window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเพื่อนคนนี้?')) return;

    const res = await removeOrRejectFriend(userData.uid, friendUid);
    if (res.success) {
      toast.success(isReject ? 'ปฏิเสธคำขอแล้ว' : 'ลบเพื่อนแล้ว');
    } else {
      toast.error(res.error);
    }
  };

  const pendingRequests = friends.filter((f) => f.status === 'pending');
  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const requestedFriends = friends.filter((f) => f.status === 'requested');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
        <UserPlus size={18} className="text-indigo-600" /> จัดการเพื่อน
      </h3>

      {/* ค้นหาเพื่อน */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchUid}
          onChange={(e) => setSearchUid(e.target.value)}
          placeholder="ค้นหาเพื่อนด้วย UID..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Search size={16} />
          )}
        </button>
      </form>

      {/* ผลการค้นหา */}
      {searchResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={
                searchResult.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchResult.id}`
              }
              alt="avatar"
              className="w-10 h-10 rounded-full border border-slate-300"
            />
            <div>
              <div className="font-bold text-sm text-slate-800">
                {searchResult.displayName || 'ไม่มีชื่อ'}
              </div>
              <div className="text-[10px] text-slate-500">UID: {searchResult.id}</div>
            </div>
          </div>
          {friends.find((f) => f.uid === searchResult.id) ? (
            <div className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-md">
              ส่งคำขอไปแล้ว/เป็นเพื่อนกันแล้ว
            </div>
          ) : (
            <button
              onClick={() => handleAddFriend(searchResult)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
              title="เพิ่มเพื่อน"
            >
              <UserPlus size={16} />
            </button>
          )}
        </div>
      )}

      {isFriendsLoading ? (
        <div className="text-center text-sm text-slate-400 py-4">กำลังโหลด...</div>
      ) : (
        <div className="space-y-4">
          {/* คำขอที่เป็น Pending (คนอื่นขอเรามา) */}
          {pendingRequests.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 border-b border-slate-100 pb-1">
                คำขอเป็นเพื่อน ({pendingRequests.length})
              </h4>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div
                    key={req.uid}
                    className="flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg border border-indigo-100"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          req.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.uid}`
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full border border-indigo-200"
                      />
                      <span className="font-bold text-sm text-slate-800">{req.displayName}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAccept(req.uid)}
                        className="bg-emerald-500 text-white p-1.5 rounded-md hover:bg-emerald-600"
                      >
                        <UserCheck size={14} />
                      </button>
                      <button
                        onClick={() => handleRemove(req.uid, true)}
                        className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600"
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* รายชื่อเพื่อนที่แอดแล้ว */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 border-b border-slate-100 pb-1 flex justify-between">
              <span>เพื่อนของฉัน ({acceptedFriends.length})</span>
              {requestedFriends.length > 0 && (
                <span className="text-indigo-400 font-normal">
                  รอตอบรับ {requestedFriends.length}
                </span>
              )}
            </h4>

            {acceptedFriends.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-2 italic">
                ยังไม่มีเพื่อน ลองค้นหาและเพิ่มเพื่อนดูสิ!
              </div>
            ) : (
              <div className="space-y-2">
                {acceptedFriends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          friend.photoURL ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.uid}`
                        }
                        alt="avatar"
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <span className="font-bold text-sm text-slate-700">{friend.displayName}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(friend.uid, false)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="ลบเพื่อน"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
