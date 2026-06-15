import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import UserTable from './components/UserTable';
import AdjustBallsModal from './components/AdjustBallsModal';

const UserManager = () => {
  const location = useLocation();
  const isBallsMode = location.pathname === '/balls';
  const { users, isLoading, error, fetchUsers, updateUserBallsAction } = useUserStore();
  
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
      await updateUserBallsAction(selectedUser.id, Number(amount), reason || 'Admin Adjusted', 'admin_123');
      closeModal();
    } catch (err) {
      console.error("Failed to adjust balls", err);
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

      <UserTable 
        users={users} 
        isLoading={isLoading} 
        openAdjustModal={openAdjustModal} 
      />

      <AdjustBallsModal 
        isModalOpen={isModalOpen}
        selectedUser={selectedUser}
        closeModal={closeModal}
        handleSubmit={handleSubmit}
        amount={amount}
        setAmount={setAmount}
        reason={reason}
        setReason={setReason}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserManager;