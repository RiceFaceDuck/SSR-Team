import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const UserManager = () => {
  const location = useLocation();
  const isBallsMode = location.pathname === '/balls';
  const { users, isLoading, error, fetchUsers, updateUserBallsAction } = useUserStore();
  
  // State สำหรับจัดการ Modal ปรับยอด Balls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAdjustModal = (user) => {
    setSelectedUser(user);
    setAmount('');
    setReason('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setAmount('');
    setReason('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || isNaN(amount) || Number(amount) === 0) return;

    setIsSubmitting(true);
    try {
      // โยนค่าให้ Store จัดการ (ใส่ Admin ID สมมติไปก่อน สามารถดึงจาก Auth Store ได้ในอนาคต)
      await updateUserBallsAction(selectedUser.id, Number(amount), reason || 'Admin Adjusted', 'admin_123');
      closeModal();
    } catch (err) {
      console.error("Failed to adjust balls", err);
      // ในระบบจริงอาจจะเพิ่ม Toast Notification แจ้งเตือน error ตรงนี้
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">เกิดข้อผิดพลาด! </strong>
        <span className="block sm:inline">{error}</span>
        <button onClick={fetchUsers} className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm">ลองใหม่</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{isBallsMode ? 'จัดการ Balls ⚽' : 'จัดการผู้เล่น (User Management)'}</h1>
        <div className="text-sm text-gray-500">
          จำนวนผู้เล่นทั้งหมด: <span className="font-bold text-blue-600">{users.length}</span> บัญชี
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ผู้เล่น
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                UID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ยอด Balls ⚽
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-gray-900 whitespace-no-wrap font-medium">
                        {user.displayName || user.username || 'Unknown User'}
                      </p>
                      <p className="text-gray-500 whitespace-no-wrap text-xs">
                        {user.email || 'No Email'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm">
                  <p className="text-gray-900 whitespace-no-wrap text-xs font-mono">{user.id}</p>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm text-right">
                  <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                    <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                    <span className="relative text-lg">{user.balls?.toLocaleString() || 0}</span>
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 bg-transparent text-sm text-center">
                  <button
                    onClick={() => openAdjustModal(user)}
                    className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-colors duration-200"
                  >
                    ปรับยอด ⚽
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                  ไม่พบข้อมูลผู้เล่นในระบบ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50 transition-opacity">
          <div className="relative w-full max-w-md mx-auto my-6">
            <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-2xl outline-none focus:outline-none">
              
              <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
                <h3 className="text-xl font-bold text-gray-800">
                  ปรับยอด Balls ⚽
                </h3>
                <button
                  className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={closeModal}
                >
                  <span className="text-2xl block outline-none focus:outline-none">×</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="relative p-6 flex-auto">
                  <p className="mb-4 text-gray-600 text-sm">
                    กำลังปรับยอดให้ผู้เล่น: <strong className="text-gray-900">{selectedUser.displayName || selectedUser.username || selectedUser.id}</strong>
                    <br />ยอดปัจจุบัน: <strong className="text-green-600">{selectedUser.balls?.toLocaleString() || 0}</strong> ⚽
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                      จำนวน (+ เพื่อเพิ่ม, - เพื่อลด)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="amount"
                      type="number"
                      placeholder="เช่น 1000 หรือ -500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
                      เหตุผล (ระบุในระบบประวัติ)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="reason"
                      type="text"
                      placeholder="เช่น ชดเชยระบบล่ม, รางวัลกิฟต์อเวย์"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end p-5 border-t border-solid border-gray-200 rounded-b">
                  <button
                    className="text-gray-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 hover:text-gray-800"
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    ยกเลิก
                  </button>
                  <button
                    className={`${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white active:bg-blue-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150`}
                    type="submit"
                    disabled={isSubmitting || !amount || Number(amount) === 0}
                  >
                    {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการปรับยอด'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;